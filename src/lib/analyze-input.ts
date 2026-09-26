import type { ImageMediaType } from "./claude";
import type { Locale } from "./prompt";

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const MEDIA_TYPES: readonly string[] = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
const LOCALES: readonly string[] = ["en", "ja"];

export type AnalyzeInput = {
  apiKey: string;
  image: File;
  mediaType: ImageMediaType;
  locale: Locale;
};

/** Server Action に届いたフォームの内容を検証する。 */
export function validateAnalyzeInput(
  formData: FormData,
):
  | { ok: true; value: AnalyzeInput }
  | { ok: false; code: "NO_API_KEY" | "INVALID_FILE" } {
  const apiKey = String(formData.get("apiKey") ?? "").trim();
  if (!apiKey) return { ok: false, code: "NO_API_KEY" };

  const image = formData.get("image");
  if (
    !(image instanceof File) ||
    image.size === 0 ||
    image.size > MAX_IMAGE_BYTES ||
    !MEDIA_TYPES.includes(image.type)
  ) {
    return { ok: false, code: "INVALID_FILE" };
  }

  const rawLocale = String(formData.get("locale") ?? "");
  const locale = (LOCALES.includes(rawLocale) ? rawLocale : "en") as Locale;

  return {
    ok: true,
    value: { apiKey, image, mediaType: image.type as ImageMediaType, locale },
  };
}
