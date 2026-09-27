import { useTranslations } from "next-intl";
import type { AnalyzeErrorCode } from "@/lib/analyze-result";

export function ErrorPanel({ code }: { code: AnalyzeErrorCode }) {
  const t = useTranslations("Errors");
  return (
    <div
      role="alert"
      className="border-secondary/30 bg-secondary/10 space-y-1 rounded-xl border p-4"
    >
      <h2 className="text-secondary font-semibold">{t(`${code}.title`)}</h2>
      <p className="text-text-primary/90 text-sm">{t(`${code}.message`)}</p>
    </div>
  );
}
