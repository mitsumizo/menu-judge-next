import { MAX_EDGE, fitWithin } from "./image";

export class ImageDecodeError extends Error {
  constructor() {
    super("Image could not be decoded");
    this.name = "ImageDecodeError";
  }
}

/**
 * 画像を長辺 maxEdge 以下の JPEG に変換する（ブラウザ専用）。
 * スマホ写真の回転情報（EXIF）を反映し、透過部分は白で塗る。
 */
export async function resizeImage(
  file: File,
  {
    maxEdge = MAX_EDGE,
    quality = 0.85,
  }: { maxEdge?: number; quality?: number } = {},
): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new ImageDecodeError();
  }

  const { width, height } = fitWithin(bitmap.width, bitmap.height, maxEdge);
  const canvas = new OffscreenCanvas(width, height);
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new ImageDecodeError();
  }
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  const name = `${file.name.replace(/\.[^.]*$/, "") || "menu"}.jpg`;
  return new File([blob], name, { type: "image/jpeg" });
}
