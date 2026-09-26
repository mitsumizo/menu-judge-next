import Anthropic from "@anthropic-ai/sdk";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CLAUDE_MODEL,
  analyzeMenuImage,
  parseMenuResponse,
  type MessagesClient,
} from "./claude";

const dish = {
  original_name: "Pad Thai",
  translated_name: "Pad Thai",
  description: "Stir-fried rice noodles",
  spiciness: 2,
  sweetness: 3,
  category: "main",
  price_range: "$$",
};
const json = JSON.stringify({ dishes: [dish] });

describe("parseMenuResponse", () => {
  it("素の JSON を解析できる", () => {
    const result = parseMenuResponse(json);
    expect(result).toEqual({
      ok: true,
      dishes: [expect.objectContaining({ original_name: "Pad Thai" })],
    });
  });

  it("```json コードブロックで囲まれていても解析できる", () => {
    expect(parseMenuResponse("```json\n" + json + "\n```").ok).toBe(true);
  });

  it("JSON の前後に説明文があっても解析できる", () => {
    const result = parseMenuResponse(
      `Here is the result:\n${json}\nHope this helps!`,
    );
    expect(result.ok).toBe(true);
  });

  it("不正な料理だけを除外して残りを返す", () => {
    const text = JSON.stringify({
      dishes: [dish, { ...dish, spiciness: 9 }, { foo: 1 }],
    });
    const result = parseMenuResponse(text);
    expect(result).toEqual({
      ok: true,
      dishes: [expect.objectContaining({ original_name: "Pad Thai" })],
    });
  });

  it("有効な料理が 0 件なら NOT_A_MENU", () => {
    expect(parseMenuResponse(JSON.stringify({ dishes: [] }))).toEqual({
      ok: false,
      code: "NOT_A_MENU",
    });
    expect(parseMenuResponse(JSON.stringify({ dishes: [{ foo: 1 }] }))).toEqual(
      {
        ok: false,
        code: "NOT_A_MENU",
      },
    );
  });

  it("JSON として読めなければ PARSE_ERROR", () => {
    expect(parseMenuResponse("I cannot read this image.")).toEqual({
      ok: false,
      code: "PARSE_ERROR",
    });
  });

  it("dishes キーが無ければ PARSE_ERROR", () => {
    expect(parseMenuResponse(JSON.stringify({ items: [dish] }))).toEqual({
      ok: false,
      code: "PARSE_ERROR",
    });
  });

  it("dishes が配列でなければ PARSE_ERROR", () => {
    expect(parseMenuResponse(JSON.stringify({ dishes: "none" }))).toEqual({
      ok: false,
      code: "PARSE_ERROR",
    });
  });
});

function fakeClient(
  create: (...args: unknown[]) => Promise<unknown>,
): MessagesClient {
  return { messages: { create } } as unknown as MessagesClient;
}

const input = {
  imageBase64: "aGVsbG8=",
  mediaType: "image/png",
  locale: "ja",
} as const;

function apiError(status: number) {
  return new Anthropic.APIError(
    status,
    { type: "error" },
    `status ${status}`,
    new Headers(),
  );
}

function textResponse(text: string, stop_reason = "end_turn") {
  return { stop_reason, content: [{ type: "text", text }] };
}

describe("analyzeMenuImage", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("画像とロケール別プロンプトを指定モデルに送る", async () => {
    const create = vi.fn().mockResolvedValue(textResponse(json));
    await analyzeMenuImage(fakeClient(create), input);

    const params = create.mock.calls[0][0];
    expect(params.model).toBe(CLAUDE_MODEL);
    expect(params.messages[0].content[0]).toEqual({
      type: "image",
      source: { type: "base64", media_type: "image/png", data: "aGVsbG8=" },
    });
    expect(params.messages[0].content[1].text).toContain("日本語訳");
  });

  it("正常な応答なら料理一覧を返す", async () => {
    const create = vi.fn().mockResolvedValue(textResponse(json));
    const result = await analyzeMenuImage(fakeClient(create), input);
    expect(result.ok && result.dishes[0].original_name).toBe("Pad Thai");
  });

  it("max_tokens で途中切れした応答は PARSE_ERROR", async () => {
    const create = vi.fn().mockResolvedValue(textResponse(json, "max_tokens"));
    expect(await analyzeMenuImage(fakeClient(create), input)).toEqual({
      ok: false,
      code: "PARSE_ERROR",
    });
  });

  it("テキストブロックが無ければ PARSE_ERROR", async () => {
    const create = vi
      .fn()
      .mockResolvedValue({ stop_reason: "end_turn", content: [] });
    expect(await analyzeMenuImage(fakeClient(create), input)).toEqual({
      ok: false,
      code: "PARSE_ERROR",
    });
  });

  it.each([
    [401, "INVALID_API_KEY"],
    [429, "RATE_LIMITED"],
  ])("API が %i を返したら %s", async (status, code) => {
    const create = vi.fn().mockRejectedValue(apiError(status));
    expect(await analyzeMenuImage(fakeClient(create), input)).toEqual({
      ok: false,
      code,
    });
  });

  it("API が 500 を返したら UNKNOWN", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const create = vi.fn().mockRejectedValue(apiError(500));
    expect(await analyzeMenuImage(fakeClient(create), input)).toEqual({
      ok: false,
      code: "UNKNOWN",
    });
  });

  it("API エラー以外の例外は UNKNOWN で、ログにはエラー名だけを残す", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const create = vi
      .fn()
      .mockRejectedValue(new TypeError("key sk-ant-secret leaked"));
    expect(await analyzeMenuImage(fakeClient(create), input)).toEqual({
      ok: false,
      code: "UNKNOWN",
    });
    expect(log).toHaveBeenCalledWith("[analyzeMenuImage] failed", {
      name: "TypeError",
    });
    expect(JSON.stringify(log.mock.calls)).not.toContain("sk-ant-secret");
  });
});
