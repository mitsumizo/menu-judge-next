import { useTranslations } from "next-intl";
import { Badge } from "@/components/atoms/Badge/Badge";
import { LevelRow } from "@/components/molecules/LevelRow/LevelRow";
import { TagList } from "@/components/molecules/TagList/TagList";
import type { Dish } from "@/lib/dish";

export function DishCard({ dish }: { dish: Dish }) {
  const t = useTranslations("Dish");
  return (
    <article className="bg-surface hover:ring-primary/40 space-y-4 rounded-2xl p-5 shadow-lg ring-1 ring-white/5 transition">
      <header className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge>{t(`category.${dish.category}`)}</Badge>
          <Badge tone={dish.price_range ? "accent" : "neutral"}>
            {dish.price_range ?? t("priceUnknown")}
          </Badge>
        </div>
        <h3 className="text-xl font-bold">{dish.translated_name}</h3>
        <p className="text-text-secondary text-sm">{dish.original_name}</p>
      </header>
      <p className="text-sm leading-relaxed">{dish.description}</p>
      <div className="space-y-2">
        <LevelRow label={t("spiciness")} level={dish.spiciness} icon="🌶️" />
        <LevelRow label={t("sweetness")} level={dish.sweetness} icon="🍬" />
      </div>
      <TagList
        label={t("ingredients")}
        items={dish.ingredients}
        emptyText={t("unknown")}
      />
      <TagList
        label={t("allergens")}
        items={dish.allergens}
        emptyText={t("unknown")}
      />
    </article>
  );
}
