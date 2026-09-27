/** Claude の画像入力で推奨される長辺の上限（px） */
export const MAX_EDGE = 1568;

/** 縦横比を保ったまま、長辺が maxEdge 以下になるサイズを返す。拡大はしない。 */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number = MAX_EDGE,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}
