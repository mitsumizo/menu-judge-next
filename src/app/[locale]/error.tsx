"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/atoms/Button/Button";
import { ErrorPanel } from "@/components/organisms/ErrorPanel/ErrorPanel";

export default function RouteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("RouteError");
  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-10">
      <ErrorPanel code="UNKNOWN" />
      <Button onClick={reset}>{t("retry")}</Button>
    </main>
  );
}
