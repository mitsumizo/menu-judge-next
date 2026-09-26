import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { use } from "react";

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  const t = useTranslations("Home");
  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-primary-light text-3xl font-bold">{t("title")}</h1>
      <p className="text-text-secondary">{t("tagline")}</p>
    </main>
  );
}
