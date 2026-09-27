import { describe, expect, it } from "vitest";
import { MAX_EDGE, fitWithin } from "./image";

describe("fitWithin", () => {
  it("長辺が上限以下なら元のサイズのまま（拡大しない）", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("長辺がちょうど上限ならそのまま", () => {
    expect(fitWithin(MAX_EDGE, 1000)).toEqual({
      width: MAX_EDGE,
      height: 1000,
    });
  });

  it("横長の画像は横幅を上限に合わせて縮小する", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 1568, height: 1176 });
  });

  it("縦長の画像は高さを上限に合わせて縮小する", () => {
    expect(fitWithin(3000, 4000)).toEqual({ width: 1176, height: 1568 });
  });

  it("極端に細長い画像でも短辺は 1px 以上", () => {
    expect(fitWithin(100000, 10)).toEqual({ width: 1568, height: 1 });
  });

  it("上限を指定できる", () => {
    expect(fitWithin(1000, 500, 100)).toEqual({ width: 100, height: 50 });
  });
});
