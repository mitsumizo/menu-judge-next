import { describe, expect, it } from "vitest";
import { INPUT_MAX_BYTES, isAcceptableInput, isHeic } from "./upload-rules";

const file = (size: number, type: string, name = "menu") =>
  new File([new Uint8Array(size)], name, { type });

describe("isAcceptableInput", () => {
  it.each([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/heic",
    "image/heif",
  ])("%s は受け付ける", (type) => {
    expect(isAcceptableInput(file(10, type))).toBe(true);
  });

  it.each(["application/pdf", "image/gif", "text/plain", ""])(
    "%j は受け付けない",
    (type) => {
      expect(isAcceptableInput(file(10, type))).toBe(false);
    },
  );

  it("空のファイルは受け付けない", () => {
    expect(isAcceptableInput(file(0, "image/jpeg"))).toBe(false);
  });

  it("上限ちょうどは受け付け、1 バイト超えたら受け付けない", () => {
    expect(isAcceptableInput(file(INPUT_MAX_BYTES, "image/jpeg"))).toBe(true);
    expect(isAcceptableInput(file(INPUT_MAX_BYTES + 1, "image/jpeg"))).toBe(
      false,
    );
  });
});

describe("isHeic", () => {
  it.each([
    ["image/heic", "IMG_0001.HEIC"],
    ["image/heif", "photo.heif"],
    ["", "IMG_0001.HEIC"],
  ])("%j / %s は HEIC", (type, name) => {
    expect(isHeic(file(10, type, name))).toBe(true);
  });

  it.each([
    ["image/jpeg", "IMG_0001.jpg"],
    ["", "menu.pdf"],
  ])("%j / %s は HEIC ではない", (type, name) => {
    expect(isHeic(file(10, type, name))).toBe(false);
  });
});

describe("isAcceptableInput（MIME が空の HEIC）", () => {
  it("Windows などで MIME が空でも拡張子が HEIC なら受け付ける", () => {
    expect(isAcceptableInput(file(10, "", "IMG_0001.HEIC"))).toBe(true);
  });

  it("MIME が空で拡張子も画像でなければ受け付けない", () => {
    expect(isAcceptableInput(file(10, "", "menu.pdf"))).toBe(false);
  });
});
