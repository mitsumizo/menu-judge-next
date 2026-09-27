// テスト・Storybook 専用。本番コードから import しないこと。

type ImageOptions = {
  width: number;
  height: number;
  type?: "image/png" | "image/jpeg";
  name?: string;
  transparent?: boolean;
};

/** 指定サイズの実画像ファイルを生成する（ブラウザ専用）。 */
export async function makeImageFile({
  width,
  height,
  type = "image/png",
  name = "menu.png",
  transparent = false,
}: ImageOptions): Promise<File> {
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2d context unavailable");
  if (!transparent) {
    context.fillStyle = "#c0392b";
    context.fillRect(0, 0, width, height);
  }
  const blob = await canvas.convertToBlob({ type });
  return new File([blob], name, { type });
}

/** 画像をデコードして実際の縦横サイズを返す。 */
export async function decodeSize(
  file: Blob,
): Promise<{ width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  const size = { width: bitmap.width, height: bitmap.height };
  bitmap.close();
  return size;
}

/** 左上 1px の RGBA を返す。 */
export async function topLeftPixel(
  file: Blob,
): Promise<[number, number, number, number]> {
  const bitmap = await createImageBitmap(file);
  const canvas = new OffscreenCanvas(1, 1);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("2d context unavailable");
  context.drawImage(bitmap, 0, 0);
  bitmap.close();
  const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
  return [r, g, b, a];
}
