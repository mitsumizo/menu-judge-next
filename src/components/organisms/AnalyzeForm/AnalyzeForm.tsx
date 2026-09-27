"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  startTransition,
  useActionState,
  useCallback,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { Button } from "@/components/atoms/Button/Button";
import { ApiKeyField } from "@/components/molecules/ApiKeyField/ApiKeyField";
import { Toast } from "@/components/molecules/Toast/Toast";
import { MAX_IMAGE_BYTES } from "@/lib/analyze-input";
import type { AnalyzeErrorCode, AnalyzeResult } from "@/lib/analyze-result";
import { loadApiKey, saveApiKey } from "@/lib/api-key-storage";
import { resizeImage } from "@/lib/resize-image";
import { INPUT_ACCEPT, isAcceptableInput, isHeic } from "@/lib/upload-rules";
import { DishList } from "../DishList/DishList";
import { DishListSkeleton } from "../DishListSkeleton/DishListSkeleton";
import { ErrorPanel } from "../ErrorPanel/ErrorPanel";
import { UploadZone } from "../UploadZone/UploadZone";

type Props = {
  action: (
    prev: AnalyzeResult | null,
    formData: FormData,
  ) => Promise<AnalyzeResult>;
};

// localStorage の変更を購読する必要はない（初回表示時に読めれば十分）
const subscribeNothing = () => () => {};

export function AnalyzeForm({ action }: Props) {
  const t = useTranslations("AnalyzeForm");
  const locale = useLocale();
  const [toastFor, setToastFor] = useState<AnalyzeResult | null>(null);
  const closeToast = useCallback(() => setToastFor(null), []);
  const [state, formAction, pending] = useActionState(
    async (
      _prev: AnalyzeResult | null,
      formData: FormData,
    ): Promise<AnalyzeResult> => {
      try {
        // 前回の結果はサーバーで使わないので送り返さない
        const result = await action(null, formData);
        if (result.ok) setToastFor(result);
        return result;
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
  const [file, setFile] = useState<File | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [clientError, setClientError] = useState<AnalyzeErrorCode | null>(null);

  function handleApiKeyChange(value: string) {
    setTypedKey(value);
    saveApiKey(value.trim());
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    // form の action 属性は使わない（React が送信後にフォームをリセットするため）。
    // 画像を縮小してから自前で FormData を組み立てて送る
    event.preventDefault();
    if (preparing || pending) return;
    const key = apiKey.trim();
    if (!key) return setClientError("NO_API_KEY");
    if (!file || !isAcceptableInput(file))
      return setClientError("INVALID_FILE");

    setPreparing(true);
    let image: File;
    try {
      image = await resizeImage(file);
    } catch {
      setPreparing(false);
      return setClientError(isHeic(file) ? "HEIC_UNSUPPORTED" : "INVALID_FILE");
    }
    setPreparing(false);
    if (image.size > MAX_IMAGE_BYTES) return setClientError("INVALID_FILE");

    setClientError(null);
    const formData = new FormData();
    formData.set("apiKey", key);
    formData.set("locale", locale);
    formData.set("image", image);
    startTransition(() => formAction(formData));
  }

  const errorCode = clientError ?? (state && !state.ok ? state.code : null);

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSubmit}
        className="bg-surface space-y-4 rounded-2xl p-5"
      >
        <ApiKeyField
          value={apiKey}
          onChange={handleApiKeyChange}
          label={t("apiKey")}
          showLabel={t("show")}
          hideLabel={t("hide")}
        />
        <UploadZone file={file} onFileChange={setFile} accept={INPUT_ACCEPT} />
        <Button
          type="submit"
          disabled={pending || preparing}
          className="w-full"
        >
          {preparing ? t("preparing") : pending ? t("analyzing") : t("submit")}
        </Button>
      </form>

      {pending || preparing ? (
        <DishListSkeleton />
      ) : (
        <>
          {errorCode && <ErrorPanel code={errorCode} />}
          {!clientError && state?.ok && <DishList dishes={state.dishes} />}
        </>
      )}
      {toastFor && toastFor === state && state.ok && (
        <Toast
          message={t("toast", { count: state.dishes.length })}
          closeLabel={t("closeToast")}
          onClose={closeToast}
        />
      )}
    </div>
  );
}
