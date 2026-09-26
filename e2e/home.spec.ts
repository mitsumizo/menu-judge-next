import { expect, test } from "@playwright/test";

test("トップページにアプリ名の見出しが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Menu Judge" })).toBeVisible();
});
