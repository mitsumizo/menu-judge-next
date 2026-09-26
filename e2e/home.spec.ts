import { expect, test } from "@playwright/test";

test("/ にアクセスすると /en にリダイレクトされる", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
});

test("/en にアプリ名とキャッチコピーが表示される", async ({ page }) => {
  await page.goto("/en");
  await expect(
    page.getByRole("heading", { level: 1, name: "Menu Judge" }),
  ).toBeVisible();
  await expect(page.getByText("Understand any restaurant menu")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
