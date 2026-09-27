import { expect, test } from "@playwright/test";

test("/en のレスポンスにセキュリティヘッダーが付く", async ({ request }) => {
  const response = await request.get("/en");
  const headers = response.headers();
  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("img-src 'self' blob: data:");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["permissions-policy"]).toContain("camera=(self)");
  expect(headers["x-frame-options"]).toBe("DENY");
});

test("/en の表示で CSP 違反が起きない", async ({ page }) => {
  const violations: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy"))
      violations.push(message.text());
  });
  await page.goto("/en");
  await expect(
    page.getByRole("heading", { level: 1, name: "Menu Judge" }),
  ).toBeVisible();
  expect(violations).toEqual([]);
});
