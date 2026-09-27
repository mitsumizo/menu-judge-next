import { describe, expect, it } from "vitest";
import { decodeSize, makeImageFile, topLeftPixel } from "@/testing/images";
import { ImageDecodeError, resizeImage } from "./resize-image";

describe("resizeImage", () => {
  it("大きい画像を長辺 1568px の JPEG に縮小する", async () => {
    const input = await makeImageFile({ width: 4000, height: 3000 });
    const output = await resizeImage(input);
    expect(output.type).toBe("image/jpeg");
    expect(output.name).toBe("menu.jpg");
    expect(await decodeSize(output)).toEqual({ width: 1568, height: 1176 });
  });

  it("小さい画像は拡大せず JPEG にだけ変換する", async () => {
    const input = await makeImageFile({ width: 640, height: 480 });
    const output = await resizeImage(input);
    expect(output.type).toBe("image/jpeg");
    expect(await decodeSize(output)).toEqual({ width: 640, height: 480 });
  });

  it("透過 PNG の透明部分は白になる", async () => {
    const input = await makeImageFile({
      width: 20,
      height: 20,
      transparent: true,
    });
    const [r, g, b] = await topLeftPixel(await resizeImage(input));
    expect(Math.min(r, g, b)).toBeGreaterThan(240);
  });

  it("縮小後はサーバー側の上限（3.75MB）を十分下回る", async () => {
    const input = await makeImageFile({ width: 4000, height: 3000 });
    expect((await resizeImage(input)).size).toBeLessThan(1024 * 1024);
  });

  it("画像として読めないファイルは ImageDecodeError", async () => {
    const broken = new File(
      [new TextEncoder().encode("not an image")],
      "menu.jpg",
      { type: "image/jpeg" },
    );
    await expect(resizeImage(broken)).rejects.toBeInstanceOf(ImageDecodeError);
  });
});
