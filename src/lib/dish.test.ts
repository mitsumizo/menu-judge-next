import { describe, expect, it } from "vitest";
import { parseDish } from "./dish";

const valid = {
  original_name: "Pad Thai",
  translated_name: "パッタイ",
  description: "米麺の炒め物",
  spiciness: 2,
  sweetness: 3,
  ingredients: ["米麺", "エビ"],
  allergens: ["甲殻類"],
  category: "main",
  price_range: "$$",
};

describe("parseDish", () => {
  it("全フィールドが正しければ Dish を返す", () => {
    expect(parseDish(valid)).toEqual(valid);
  });

  it("ingredients / allergens が無ければ空配列を補う", () => {
    const { ingredients: _i, allergens: _a, ...rest } = valid;
    expect(parseDish(rest)).toMatchObject({ ingredients: [], allergens: [] });
  });

  it.each([
    "original_name",
    "translated_name",
    "description",
    "spiciness",
    "sweetness",
  ])("必須フィールド %s が無ければ null", (key) => {
    const data: Record<string, unknown> = { ...valid };
    delete data[key];
    expect(parseDish(data)).toBeNull();
  });

  it.each([1, 5])("spiciness の境界値 %i は受け付ける", (level) => {
    expect(parseDish({ ...valid, spiciness: level })?.spiciness).toBe(level);
  });

  it.each([0, 6, 2.5, "3"])("spiciness が %s なら null", (level) => {
    expect(parseDish({ ...valid, spiciness: level })).toBeNull();
  });

  it.each([0, 6, 2.5, "3"])("sweetness が %s なら null", (level) => {
    expect(parseDish({ ...valid, sweetness: level })).toBeNull();
  });

  it("想定外の category は other にする", () => {
    expect(parseDish({ ...valid, category: "snack" })?.category).toBe("other");
  });

  it("category が無ければ other にする", () => {
    const { category: _c, ...rest } = valid;
    expect(parseDish(rest)?.category).toBe("other");
  });

  it.each([null, "$$$$$", "cheap"])(
    "price_range が %s なら null にする",
    (price) => {
      expect(
        parseDish({ ...valid, price_range: price })?.price_range,
      ).toBeNull();
    },
  );

  it("price_range が無ければ null にする", () => {
    const { price_range: _p, ...rest } = valid;
    expect(parseDish(rest)?.price_range).toBeNull();
  });

  it("オブジェクト以外は null", () => {
    expect(parseDish("Pad Thai")).toBeNull();
    expect(parseDish(null)).toBeNull();
  });
});
