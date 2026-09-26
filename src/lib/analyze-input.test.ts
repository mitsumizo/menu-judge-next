import { describe, expect, it } from "vitest";
import { MAX_IMAGE_BYTES, validateAnalyzeInput } from "./analyze-input";

function form(fields: {
  apiKey?: string;
  image?: File | string;
  locale?: string;
}) {
  const fd = new FormData();
  if (fields.apiKey !== undefined) fd.set("apiKey", fields.apiKey);
  if (fields.image !== undefined) fd.set("image", fields.image);
  if (fields.locale !== undefined) fd.set("locale", fields.locale);
  return fd;
}

const png = (size = 10) =>
  new File([new Uint8Array(size)], "menu.png", { type: "image/png" });

describe("validateAnalyzeInput", () => {
  it("正しい入力なら値を返す（APIキーは前後の空白を除く）", () => {
    const result = validateAnalyzeInput(
      form({ apiKey: "  sk-ant-x  ", image: png(), locale: "en" }),
    );
    expect(result).toMatchObject({
      ok: true,
      value: { apiKey: "sk-ant-x", mediaType: "image/png", locale: "en" },
    });
  });

  it.each([undefined, "", "   "])("APIキーが %j なら NO_API_KEY", (apiKey) => {
    expect(
      validateAnalyzeInput(form({ apiKey, image: png(), locale: "en" })),
    ).toEqual({
      ok: false,
      code: "NO_API_KEY",
    });
  });

  it("画像が無ければ INVALID_FILE", () => {
    expect(validateAnalyzeInput(form({ apiKey: "k", locale: "en" }))).toEqual({
      ok: false,
      code: "INVALID_FILE",
    });
  });

  it("画像欄が文字列なら INVALID_FILE", () => {
    expect(
      validateAnalyzeInput(
        form({ apiKey: "k", image: "menu.png", locale: "en" }),
      ),
    ).toEqual({
      ok: false,
      code: "INVALID_FILE",
    });
  });

  it("空のファイルは INVALID_FILE", () => {
    expect(
      validateAnalyzeInput(form({ apiKey: "k", image: png(0), locale: "en" })),
    ).toEqual({
      ok: false,
      code: "INVALID_FILE",
    });
  });

  it("上限ちょうどのサイズは受け付ける", () => {
    expect(
      validateAnalyzeInput(
        form({ apiKey: "k", image: png(MAX_IMAGE_BYTES), locale: "en" }),
      ).ok,
    ).toBe(true);
  });

  it("上限サイズの画像は base64 化しても Anthropic の 5MB 上限に収まる", () => {
    expect(Math.ceil(MAX_IMAGE_BYTES / 3) * 4).toBeLessThanOrEqual(
      5 * 1024 * 1024,
    );
  });

  it("base64 化すると 5MB を超える 4MiB の画像は INVALID_FILE", () => {
    expect(
      validateAnalyzeInput(
        form({ apiKey: "k", image: png(4 * 1024 * 1024), locale: "en" }),
      ),
    ).toEqual({
      ok: false,
      code: "INVALID_FILE",
    });
  });

  it("上限を 1 バイト超えたら INVALID_FILE", () => {
    expect(
      validateAnalyzeInput(
        form({ apiKey: "k", image: png(MAX_IMAGE_BYTES + 1), locale: "en" }),
      ),
    ).toEqual({
      ok: false,
      code: "INVALID_FILE",
    });
  });

  it.each(["image/heic", "image/gif", "application/pdf"])(
    "%s は INVALID_FILE",
    (type) => {
      const file = new File([new Uint8Array(10)], "menu", { type });
      expect(
        validateAnalyzeInput(form({ apiKey: "k", image: file, locale: "en" })),
      ).toEqual({
        ok: false,
        code: "INVALID_FILE",
      });
    },
  );

  it.each(["image/jpeg", "image/webp"])("%s は受け付ける", (type) => {
    const file = new File([new Uint8Array(10)], "menu", { type });
    expect(
      validateAnalyzeInput(form({ apiKey: "k", image: file, locale: "en" })).ok,
    ).toBe(true);
  });

  it("未知のロケールは en として扱う", () => {
    const result = validateAnalyzeInput(
      form({ apiKey: "k", image: png(), locale: "fr" }),
    );
    expect(result.ok && result.value.locale).toBe("en");
  });
});
