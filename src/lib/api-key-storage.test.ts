import { describe, expect, it } from "vitest";
import { API_KEY_STORAGE_KEY, loadApiKey, saveApiKey } from "./api-key-storage";

function memoryStorage() {
  const map = new Map<string, string>();
  return {
    getItem: (k: string) => map.get(k) ?? null,
    setItem: (k: string, v: string) => void map.set(k, v),
    removeItem: (k: string) => void map.delete(k),
    map,
  };
}

const throwing = {
  getItem: () => {
    throw new DOMException("denied", "SecurityError");
  },
  setItem: () => {
    throw new DOMException("quota", "QuotaExceededError");
  },
  removeItem: () => {
    throw new DOMException("denied", "SecurityError");
  },
};

describe("api-key-storage", () => {
  it("保存したキーを読み出せる", () => {
    const storage = memoryStorage();
    saveApiKey("sk-ant-x", storage);
    expect(storage.map.get(API_KEY_STORAGE_KEY)).toBe("sk-ant-x");
    expect(loadApiKey(storage)).toBe("sk-ant-x");
  });

  it("未保存なら空文字", () => {
    expect(loadApiKey(memoryStorage())).toBe("");
  });

  it("空文字を保存すると削除される", () => {
    const storage = memoryStorage();
    saveApiKey("sk-ant-x", storage);
    saveApiKey("", storage);
    expect(storage.map.has(API_KEY_STORAGE_KEY)).toBe(false);
  });

  it("読み出しで例外が出ても空文字を返す", () => {
    expect(loadApiKey(throwing)).toBe("");
  });

  it("保存で例外が出ても投げない", () => {
    expect(() => saveApiKey("sk-ant-x", throwing)).not.toThrow();
    expect(() => saveApiKey("", throwing)).not.toThrow();
  });

  it("localStorage が存在しない環境（サーバー）でも投げない", () => {
    expect(loadApiKey()).toBe("");
    expect(() => saveApiKey("sk-ant-x")).not.toThrow();
  });
});
