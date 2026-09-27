import { useTranslations } from "next-intl";
import type { Dish } from "@/lib/dish";
import { DishCard } from "../DishCard/DishCard";

export function DishList({ dishes }: { dishes: Dish[] }) {
  const t = useTranslations("DishList");
  return (
    <section aria-label={t("label")} aria-live="polite" className="space-y-4">
      <p className="text-text-secondary text-sm">
        {t("count", { count: dishes.length })}
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        {dishes.map((dish, i) => (
          <DishCard key={`${dish.original_name}-${i}`} dish={dish} />
        ))}
      </div>
    </section>
  );
}
