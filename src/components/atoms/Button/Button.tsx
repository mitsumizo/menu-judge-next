import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

const styles = {
  primary:
    "bg-gradient-to-r from-primary to-accent text-white shadow-lg hover:from-primary-light active:scale-95",
  ghost:
    "border border-white/10 text-text-secondary hover:bg-surface active:scale-95",
} as const;

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: Props) {
  return (
    <button
      type={type}
      data-variant={variant}
      className={`rounded-xl px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
      {...rest}
    />
  );
}
