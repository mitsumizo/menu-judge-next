import type { Dish } from "./dish";

export const ANALYZE_ERROR_CODES = [
  "NO_API_KEY",
  "INVALID_FILE",
  // ブラウザが HEIC を読めない（サーバーは返さない、ブラウザ側だけのコード）
  "HEIC_UNSUPPORTED",
  "INVALID_API_KEY",
  "RATE_LIMITED",
  "NOT_A_MENU",
  "PARSE_ERROR",
  "UNKNOWN",
] as const;

export type AnalyzeErrorCode = (typeof ANALYZE_ERROR_CODES)[number];

export type AnalyzeResult =
  { ok: true; dishes: Dish[] } | { ok: false; code: AnalyzeErrorCode };
