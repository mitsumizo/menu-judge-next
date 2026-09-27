import { useTranslations } from "next-intl";

export function DishListSkeleton({ count = 4 }: { count?: number }) {
  const t = useTranslations("DishListSkeleton");
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label={t("label")}
      className="grid gap-4 sm:grid-cols-2"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          data-testid="dish-skeleton"
          className="bg-surface h-64 rounded-2xl ring-1 ring-white/5 motion-safe:animate-pulse"
        />
      ))}
    </div>
  );
}
