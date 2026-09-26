export const API_KEY_STORAGE_KEY = "menu-judge:api-key";

function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

/** 保存済みの APIキーを返す。使えない環境では空文字。 */
export function loadApiKey(
  storage: Pick<Storage, "getItem"> | undefined = defaultStorage(),
): string {
  try {
    return storage?.getItem(API_KEY_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

/** APIキーを保存する（空文字なら削除）。失敗しても例外は投げない。 */
export function saveApiKey(
  value: string,
  storage:
    Pick<Storage, "setItem" | "removeItem"> | undefined = defaultStorage(),
): void {
  try {
    if (value) storage?.setItem(API_KEY_STORAGE_KEY, value);
    else storage?.removeItem(API_KEY_STORAGE_KEY);
  } catch {
    // プライベートブラウズ等で保存できない場合は、保存せずに続行する
  }
}
