import "server-only";
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
