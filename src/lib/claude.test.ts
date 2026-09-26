import { describe, expect, it } from "vitest";
import { parseMenuResponse } from "./claude";

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
