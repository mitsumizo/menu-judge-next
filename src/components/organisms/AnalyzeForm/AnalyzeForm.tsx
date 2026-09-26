"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  startTransition,
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
  const [state, formAction, pending] = useActionState(
    async (
      _prev: AnalyzeResult | null,
      formData: FormData,
    ): Promise<AnalyzeResult> => {
      try {
        // 前回の結果はサーバーで使わないので送り返さない
        return await action(null, formData);
      } catch {
        // 通信断・タイムアウトなどでアクション自体が失敗しても、画面は残してエラー表示にする
        return { ok: false, code: "UNKNOWN" };
      }
    },
    null,
  );
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
    // form の action 属性経由だと React が送信後にフォームをリセットし、選んだ写真が消える。
    // 自前で送信して、再試行時も同じ写真を使えるようにする
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const image = formData.get("image");
    const error: AnalyzeErrorCode | null = !apiKey.trim()
      ? "NO_API_KEY"
      : !(image instanceof File) ||
          image.size === 0 ||
          image.size > MAX_IMAGE_BYTES ||
          !ACCEPTED_TYPES.includes(image.type)
        ? "INVALID_FILE"
        : null;
    setClientError(error);
    if (error) return;
    startTransition(() => formAction(formData));
  }

  const errorCode = clientError ?? (state && !state.ok ? state.code : null);

  return (
    <div className="space-y-8">
      <form
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
