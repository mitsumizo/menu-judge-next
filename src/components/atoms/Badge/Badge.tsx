import type { ReactNode } from "react";

const tones = {
  primary: "bg-primary/15 text-primary-light",
  accent: "bg-accent/15 text-accent",
  neutral: "bg-white/5 text-text-secondary",
} as const;

type Props = { children: ReactNode; tone?: keyof typeof tones };

export function Badge({ children, tone = "primary" }: Props) {
  return (
    <span
      data-tone={tone}
      className={`rounded-md px-2 py-0.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
