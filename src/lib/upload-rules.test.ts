import { describe, expect, it } from "vitest";
import { INPUT_MAX_BYTES, isAcceptableInput } from "./upload-rules";

const file = (size: number, type: string) =>
  new File([new Uint8Array(size)], "menu", { type });

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
