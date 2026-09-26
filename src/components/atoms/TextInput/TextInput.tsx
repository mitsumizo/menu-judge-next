import type { InputHTMLAttributes } from "react";

export function TextInput({
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`bg-surface text-text-primary placeholder:text-text-secondary focus:ring-primary w-full rounded-xl border border-white/10 px-4 py-3 focus:ring-2 focus:outline-none ${className}`}
      {...rest}
    />
  );
}
