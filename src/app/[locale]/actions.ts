"use server";

import type { AnalyzeResult } from "@/lib/analyze-result";
import { validateAnalyzeInput } from "@/lib/analyze-input";
import { analyzeMenuImage, createClaudeClient } from "@/lib/claude";

export async function analyzeMenu(
  _prev: AnalyzeResult | null,
  formData: FormData,
): Promise<AnalyzeResult> {
  const input = validateAnalyzeInput(formData);
  if (!input.ok) return input;

  const { apiKey, image, mediaType, locale } = input.value;
  const imageBase64 = Buffer.from(await image.arrayBuffer()).toString("base64");
  const started = Date.now();
  const result = await analyzeMenuImage(createClaudeClient(apiKey), {
    imageBase64,
    mediaType,
    locale,
  });
  console.info("[analyzeMenu]", {
    code: result.ok ? "OK" : result.code,
    ms: Date.now() - started,
  });
  return result;
}
