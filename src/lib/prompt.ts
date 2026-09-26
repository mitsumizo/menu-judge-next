export type Locale = "en" | "ja";

type PromptText = {
  system: string;
  fields: string[];
  outputIntro: string;
  notes: string;
  example: {
    name: string;
    description: string;
    ingredients: string[];
    allergens: string[];
  };
};

const TEXT: Record<Locale, PromptText> = {
  en: {
    system:
      "This image is a restaurant menu. Please extract the following information for each dish in the image in JSON format.",
    fields: [
      "original_name: Original dish name (as written on the menu)",
      "translated_name: Dish name translated into English (if not already in English, translate it)",
      "description: Dish description (approximately 50 words in English)",
      "spiciness: Spiciness level (integer from 1 to 5, where 1=not spicy, 5=very spicy)",
      "sweetness: Sweetness level (integer from 1 to 5, where 1=not sweet, 5=very sweet)",
      "ingredients: List of main ingredients (in English)",
      "allergens: List of allergens (in English, e.g., eggs, dairy, wheat, soba, peanuts, shrimp, crab, etc.)",
      'category: Dish category (one of "appetizer", "main", "dessert", "beverage", "other")',
      'price_range: Price range (one of "$", "$$", "$$$", "$$$$", or null if cannot be determined)',
    ],
    outputIntro: "Output in the following JSON format:",
    notes:
      "Important notes:\n- spiciness and sweetness must be integers from 1 to 5\n- If information is unknown, use empty lists for ingredients or allergens\n- If price_range cannot be determined, use null\n- Do not include any text other than JSON\n- Must output valid JSON format",
    example: {
      name: "Pad Thai",
      description:
        "Thai-style stir-fried rice noodles with shrimp, eggs, bean sprouts, and peanuts",
      ingredients: [
        "rice noodles",
        "shrimp",
        "eggs",
        "bean sprouts",
        "peanuts",
      ],
      allergens: ["shellfish", "eggs", "nuts"],
    },
  },
  ja: {
    system:
      "この画像はレストランのメニューです。画像内の各料理について、以下の情報をJSON形式で抽出してください。",
    fields: [
      "original_name: 料理の原語名（メニューに記載されている通り）",
      "translated_name: 料理名の日本語訳（既に日本語の場合はそのまま）",
      "description: 料理の説明（日本語で約50文字）",
      "spiciness: 辛さレベル（1から5の整数、1=辛くない、5=非常に辛い）",
      "sweetness: 甘さレベル（1から5の整数、1=甘くない、5=非常に甘い）",
      "ingredients: 主な材料のリスト（日本語）",
      "allergens: アレルゲンのリスト（日本語、例: 卵、乳製品、小麦、そば、ピーナッツ、エビ、カニなど）",
      'category: 料理のカテゴリ（"appetizer"、"main"、"dessert"、"beverage"、"other"のいずれか）',
      'price_range: 価格帯（"$"、"$$"、"$$$"、"$$$$"のいずれか、判別できない場合はnull）',
    ],
    outputIntro: "以下のJSON形式で出力してください:",
    notes:
      "重要な注意事項:\n- spicinessとsweetnessは1から5の整数でなければなりません\n- 情報が不明な場合、ingredientsまたはallergensには空のリストを使用してください\n- price_rangeが判別できない場合はnullを使用してください\n- JSON以外のテキストを含めないでください\n- 有効なJSON形式で出力する必要があります",
    example: {
      name: "パッタイ",
      description:
        "タイ風焼きそば。米麺を使い、エビ、卵、もやし、ピーナッツを炒めた料理",
      ingredients: ["米麺", "エビ", "卵", "もやし", "ピーナッツ"],
      allergens: ["甲殻類", "卵", "ナッツ"],
    },
  },
};

/** メニュー解析用のプロンプトを、指定ロケールの言語で組み立てる。 */
export function buildMenuPrompt(locale: Locale): string {
  const t = TEXT[locale];
  const example = {
    dishes: [
      {
        original_name: "Pad Thai",
        translated_name: t.example.name,
        description: t.example.description,
        spiciness: 2,
        sweetness: 3,
        ingredients: t.example.ingredients,
        allergens: t.example.allergens,
        category: "main",
        price_range: "$$",
      },
    ],
  };

  return [
    t.system,
    "",
    "For each dish, include the following information:",
    ...t.fields.map((f) => `- ${f}`),
    "",
    t.outputIntro,
    "```json",
    JSON.stringify(example, null, 2),
    "```",
    "",
    t.notes,
  ].join("\n");
}
