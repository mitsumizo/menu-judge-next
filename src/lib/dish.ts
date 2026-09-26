import { z } from "zod";

export const CATEGORIES = [
  "appetizer",
  "main",
  "dessert",
  "beverage",
  "other",
] as const;
export const PRICE_RANGES = ["$", "$$", "$$$", "$$$$"] as const;

export type Category = (typeof CATEGORIES)[number];
export type PriceRange = (typeof PRICE_RANGES)[number];

const level = z.number().int().min(1).max(5);

const dishSchema = z.object({
  original_name: z.string(),
  translated_name: z.string(),
  description: z.string(),
  spiciness: level,
  sweetness: level,
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  category: z.enum(CATEGORIES).catch("other"),
  price_range: z.enum(PRICE_RANGES).nullable().catch(null),
});

export type Dish = z.infer<typeof dishSchema>;

/** Claude の応答に含まれる料理 1 件を検証する。不正な場合は null を返す。 */
export function parseDish(input: unknown): Dish | null {
  const result = dishSchema.safeParse(input);
  return result.success ? result.data : null;
}
