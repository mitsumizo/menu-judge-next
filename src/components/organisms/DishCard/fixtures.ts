import type { Dish } from "@/lib/dish";

export const padThai: Dish = {
  original_name: "ผัดไทย",
  translated_name: "Pad Thai",
  description: "Thai-style stir-fried rice noodles with shrimp and peanuts",
  spiciness: 2,
  sweetness: 3,
  ingredients: ["rice noodles", "shrimp", "peanuts"],
  allergens: ["shellfish", "nuts"],
  category: "main",
  price_range: "$$",
};
