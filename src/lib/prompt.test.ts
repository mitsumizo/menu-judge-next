import { describe, expect, it } from "vitest";
import { buildMenuPrompt } from "./prompt";

const FIELDS = [
  "original_name",
  "translated_name",
  "description",
  "spiciness",
  "sweetness",
  "ingredients",
  "allergens",
  "category",
  "price_range",
];

describe("buildMenuPrompt", () => {
  it.each(["en", "ja"] as const)(
    "%s のプロンプトに全フィールド名が含まれる",
    (locale) => {
      const prompt = buildMenuPrompt(locale);
      for (const field of FIELDS) expect(prompt).toContain(field);
    },
  );

  it("en は英語で翻訳するよう指示する", () => {
    expect(buildMenuPrompt("en")).toContain("translated into English");
  });

  it("ja は日本語で翻訳するよう指示する", () => {
    expect(buildMenuPrompt("ja")).toContain("日本語訳");
  });

  it.each(["en", "ja"] as const)(
    "%s の出力例は dishes を持つ有効な JSON",
    (locale) => {
      const match = buildMenuPrompt(locale).match(/```json\n([\s\S]+?)\n```/);
      expect(match).not.toBeNull();
      const example = JSON.parse(match![1]);
      expect(example.dishes[0].original_name).toBe("Pad Thai");
    },
  );
});
