"use client";

import { useTranslations } from "next-intl";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type DragEvent,
} from "react";
import { Button } from "@/components/atoms/Button/Button";

type Props = {
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept: string;
};

const pickButton =
  "cursor-pointer rounded-xl border border-white/10 px-4 py-2 text-sm font-semibold text-text-primary transition hover:bg-white/5 focus-within:ring-2 focus-within:ring-primary";

export function UploadZone({ file, onFileChange, accept }: Props) {
  const t = useTranslations("UploadZone");
  const [dragging, setDragging] = useState(false);
  const previewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];
    if (selected) onFileChange(selected);
    // 同じファイルを選び直しても change が発火するようにする
    event.target.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(true);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) onFileChange(dropped);
  }

  return (
    <div
      role="group"
      aria-label={t("dropHint")}
      data-dragging={dragging}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className="data-[dragging=true]:border-primary data-[dragging=true]:bg-primary/5 space-y-3 rounded-2xl border-2 border-dashed border-white/10 p-5 text-center transition"
    >
      {file && previewUrl ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: URL のプレビューには next/image を使えない */}
          <img
            src={previewUrl}
            alt={file.name}
            className="mx-auto max-h-48 rounded-lg object-contain"
          />
          <Button variant="ghost" onClick={() => onFileChange(null)}>
            {t("remove")}
          </Button>
        </div>
      ) : (
        <p className="text-text-secondary text-sm">{t("dropHint")}</p>
      )}
      <div className="flex flex-wrap justify-center gap-2">
        <label className={pickButton}>
          {t("choose")}
          <input
            type="file"
            accept={accept}
            onChange={handleInput}
            className="sr-only"
          />
        </label>
        <label className={pickButton}>
          {t("takePhoto")}
          <input
            type="file"
            accept={accept}
            capture="environment"
            onChange={handleInput}
            className="sr-only"
          />
        </label>
      </div>
      <p className="text-text-secondary/70 text-xs">{t("limits")}</p>
    </div>
  );
}
