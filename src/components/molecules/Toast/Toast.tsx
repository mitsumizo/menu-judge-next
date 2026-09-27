"use client";

import { useEffect } from "react";

type Props = {
  message: string;
  onClose: () => void;
  closeLabel: string;
  duration?: number;
};

export function Toast({
  message,
  onClose,
  closeLabel,
  duration = 4000,
}: Props) {
  useEffect(() => {
    const id = setTimeout(onClose, duration);
    return () => clearTimeout(id);
  }, [onClose, duration]);

  return (
    <div
      role="status"
      className="bg-surface ring-primary/40 fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-sm items-center justify-between gap-4 rounded-xl px-4 py-3 shadow-lg ring-1 motion-safe:animate-[toast-in_200ms_ease-out]"
    >
      <span className="text-sm">{message}</span>
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="text-text-secondary hover:text-text-primary"
      >
        ×
      </button>
    </div>
  );
}
