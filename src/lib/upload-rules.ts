/** ブラウザで受け付ける元画像の上限（縮小前） */
export const INPUT_MAX_BYTES = 10 * 1024 * 1024;

/** HEIC/HEIF はデコードできるブラウザ（Safari）でのみ縮小に成功する */
export const INPUT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
];
export const INPUT_ACCEPT = INPUT_TYPES.join(",");

/** 縮小前の元画像として受け付けられるかを判定する。 */
export function isAcceptableInput(file: File): boolean {
  return (
    file.size > 0 &&
    file.size <= INPUT_MAX_BYTES &&
    INPUT_TYPES.includes(file.type)
  );
}
