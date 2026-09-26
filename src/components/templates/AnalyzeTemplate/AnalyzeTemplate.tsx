import type { ReactNode } from "react";

export function AnalyzeTemplate({
  header,
  children,
}: {
  header: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10">
      {header}
      {children}
    </main>
  );
}
