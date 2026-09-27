import { setRequestLocale } from "next-intl/server";
import { use } from "react";
import { AnalyzeForm } from "@/components/organisms/AnalyzeForm/AnalyzeForm";
import { Header } from "@/components/organisms/Header/Header";
import { AnalyzeTemplate } from "@/components/templates/AnalyzeTemplate/AnalyzeTemplate";
import { analyzeMenu } from "./actions";

// Server Action の実行時間の上限（秒）。Claude SDK のタイムアウト（55 秒）より長くする
export const maxDuration = 60;

export default function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  setRequestLocale(locale);
  return (
    <AnalyzeTemplate header={<Header />}>
      <AnalyzeForm action={analyzeMenu} />
    </AnalyzeTemplate>
  );
}
