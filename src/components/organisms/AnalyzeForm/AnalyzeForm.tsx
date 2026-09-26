"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  useActionState,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Button } from "@/components/atoms/Button/Button";
import { ApiKeyField } from "@/components/molecules/ApiKeyField/ApiKeyField";
import { MAX_IMAGE_BYTES } from "@/lib/analyze-input";
import type { AnalyzeErrorCode, AnalyzeResult } from "@/lib/analyze-result";
import { loadApiKey, saveApiKey } from "@/lib/api-key-storage";
import { DishList } from "../DishList/DishList";

type Props = {
  action: (
    prev: AnalyzeResult | null,
    formData: FormData,
  ) => Promise<AnalyzeResult>;
};

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPT = ACCEPTED_TYPES.join(",");

// localStorage の変更を購読する必要はない（初回表示時に読めれば十分）
const subscribeNothing = () => () => {};

export function AnalyzeForm({ action }: Props) {
  const t = useTranslations("AnalyzeForm");
  const tErrors = useTranslations("Errors");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(action, null);
  // サーバー（SSG）では空文字、ブラウザでは保存済みのキーを使う。ハイドレーション不一致を起こさない
  const savedKey = useSyncExternalStore(subscribeNothing, loadApiKey, () => "");
  const [typedKey, setTypedKey] = useState<string | null>(null);
  const apiKey = typedKey ?? savedKey;
  const [clientError, setClientError] = useState<AnalyzeErrorCode | null>(null);

  function handleApiKeyChange(value: string) {
    setTypedKey(value);
    saveApiKey(value.trim());
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const image = new FormData(event.currentTarget).get("image");
    const error: AnalyzeErrorCode | null = !apiKey.trim()
      ? "NO_API_KEY"
      : !(image instanceof File) ||
          image.size === 0 ||
          image.size > MAX_IMAGE_BYTES ||
          !ACCEPTED_TYPES.includes(image.type)
        ? "INVALID_FILE"
        : null;
    setClientError(error);
    if (error) event.preventDefault();
  }

  const errorCode = clientError ?? (state && !state.ok ? state.code : null);

  return (
    <div className="space-y-8">
      <form
        action={formAction}
        onSubmit={handleSubmit}
        className="bg-surface space-y-4 rounded-2xl p-5"
      >
        <input type="hidden" name="locale" value={locale} />
        <ApiKeyField
          value={apiKey}
          onChange={handleApiKeyChange}
          label={t("apiKey")}
          showLabel={t("show")}
          hideLabel={t("hide")}
        />
        <label className="block space-y-2">
          <span className="text-text-secondary text-sm">{t("image")}</span>
          <input
            type="file"
            name="image"
            accept={ACCEPT}
            className="text-text-secondary file:bg-primary block w-full text-sm file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:text-white"
          />
        </label>
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? t("analyzing") : t("submit")}
        </Button>
      </form>

      {errorCode && (
        <p
          role="alert"
          className="bg-secondary/10 text-secondary rounded-xl p-4 text-sm"
        >
          {tErrors(errorCode)}
        </p>
      )}
      {!clientError && state?.ok && <DishList dishes={state.dishes} />}
    </div>
  );
}
