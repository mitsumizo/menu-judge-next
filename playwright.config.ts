import { defineConfig, devices } from "@playwright/test";

// Dedicated port so e2e never collides with an unrelated dev server
// that may already be running on the default port 3000.
const PORT = 3100;

export default defineConfig({
  testDir: "./e2e",
  use: { baseURL: `http://localhost:${PORT}` },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: process.env.CI
      ? `npm run start -- -p ${PORT}`
      : `npm run dev -- -p ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
