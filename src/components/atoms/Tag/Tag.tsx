import type { ReactNode } from "react";

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="text-text-secondary rounded-full bg-white/5 px-3 py-1 text-xs ring-1 ring-white/10">
      {children}
    </span>
  );
}
