import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("Home");
  return (
    <header className="space-y-1">
      <h1 className="from-primary-light to-secondary bg-gradient-to-r bg-clip-text text-4xl font-bold text-transparent">
        {t("title")}
      </h1>
      <p className="text-text-secondary">{t("tagline")}</p>
    </header>
  );
}
