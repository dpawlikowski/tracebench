import { test, expect } from "@playwright/test";

/**
 * Browser check — mirrors thin e2e: landing + runs list smoke.
 * ENVIRONMENT_URL / CHECKLY_BASE_URL for deployed targets; localhost for local dry-runs.
 */
const base =
  process.env.ENVIRONMENT_URL ??
  process.env.CHECKLY_BASE_URL ??
  "http://127.0.0.1:3000";

test.describe("Tracebench critical surfaces", () => {
  test("homepage loads", async ({ page }) => {
    const res = await page.goto(base);
    expect(res?.status()).toBeLessThan(400);
    await expect(page.getByRole("heading").first()).toBeVisible();
  });

  test("runs list reachable", async ({ page }) => {
    await page.goto(`${base}/runs`);
    await expect(page.getByRole("heading", { name: /Agent runs/i })).toBeVisible({
      timeout: 20_000,
    });
  });
});
