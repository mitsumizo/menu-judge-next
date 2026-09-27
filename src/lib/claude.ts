import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { buildMenuPrompt, type Locale } from "./prompt";
import type { AnalyzeResult } from "./analyze-result";
import { parseDish, type Dish } from "./dish";

/** Claude の応答テキストから料理一覧を取り出す。 */
export function parseMenuResponse(text: string): AnalyzeResult {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return { ok: false, code: "PARSE_ERROR" };

  let data: unknown;
  try {
    data = JSON.parse(text.slice(start, end + 1));
  } catch {
    return { ok: false, code: "PARSE_ERROR" };
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !Array.isArray((data as { dishes?: unknown }).dishes)
  ) {
    return { ok: false, code: "PARSE_ERROR" };
  }

  const dishes = (data as { dishes: unknown[] }).dishes
    .map(parseDish)
    .filter((d): d is Dish => d !== null);

  return dishes.length > 0
    ? { ok: true, dishes }
    : { ok: false, code: "NOT_A_MENU" };
}

export const CLAUDE_MODEL = "claude-sonnet-5";
export const MAX_TOKENS = 8192;

export type ImageMediaType = "image/jpeg" | "image/png" | "image/webp";
export type MessagesClient = Pick<Anthropic, "messages">;

// ページの maxDuration（60 秒）から、画像の受け取りや応答の解析に使う 5 秒を引いた範囲に収める。
// SDK はタイムアウトも再試行するため、再試行はしない（利用者が再送信できる）
export const CLAUDE_TIMEOUT_MS = 50_000;
export const CLAUDE_MAX_RETRIES = 0;

/** ユーザーの APIキーで Anthropic クライアントを作る。baseURL は SDK が ANTHROPIC_BASE_URL から読む。 */
export function createClaudeClient(apiKey: string): Anthropic {
  return new Anthropic({
    apiKey,
    timeout: CLAUDE_TIMEOUT_MS,
    maxRetries: CLAUDE_MAX_RETRIES,
  });
}

/** メニュー画像を Claude に送り、料理一覧またはエラーコードを返す。例外は投げない。 */
export async function analyzeMenuImage(
  client: MessagesClient,
  input: { imageBase64: string; mediaType: ImageMediaType; locale: Locale },
): Promise<AnalyzeResult> {
  try {
    const message = await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: MAX_TOKENS,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: input.mediaType,
                data: input.imageBase64,
              },
            },
            { type: "text", text: buildMenuPrompt(input.locale) },
          ],
        },
      ],
    });

    if (message.stop_reason === "max_tokens")
      return { ok: false, code: "PARSE_ERROR" };
    const text = message.content.find((block) => block.type === "text");
    if (!text || text.type !== "text")
      return { ok: false, code: "PARSE_ERROR" };
    return parseMenuResponse(text.text);
  } catch (error) {
    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) return { ok: false, code: "INVALID_API_KEY" };
      if (error.status === 429) return { ok: false, code: "RATE_LIMITED" };
      // 読めない画像・サイズ超過など、画像が原因の 400 は利用者が写真を選び直せば解決する
      if (error.status === 400 && /image/i.test(error.message))
        return { ok: false, code: "INVALID_FILE" };
    }
    // APIキーを含みうるメッセージ本文は出さず、エラー名だけを記録する
    console.error("[analyzeMenuImage] failed", {
      name: (error as Error)?.name,
    });
    return { ok: false, code: "UNKNOWN" };
  }
}
