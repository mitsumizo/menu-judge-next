import type { Dish } from "./dish";

export const ANALYZE_ERROR_CODES = [
  "NO_API_KEY",
  "INVALID_FILE",
  "INVALID_API_KEY",
  "RATE_LIMITED",
  "NOT_A_MENU",
  "PARSE_ERROR",
  "UNKNOWN",
] as const;

export type AnalyzeErrorCode = (typeof ANALYZE_ERROR_CODES)[number];

export type AnalyzeResult =
  { ok: true; dishes: Dish[] } | { ok: false; code: AnalyzeErrorCode };
