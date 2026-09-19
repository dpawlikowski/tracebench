import { test, expect } from "@playwright/test";

test("dashboards loads without client crash", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  await page.goto("/dashboards", { waitUntil: "networkidle" });
  await expect(page.getByTestId("dashboard-board").or(page.getByTestId("dashboard-loading"))).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByTestId("dashboard-board")).toBeVisible({ timeout: 20000 });
  await expect(page.getByTestId("widget-cost_burn")).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(2000);
  expect(pageErrors, pageErrors.join("\n")).toEqual([]);
});

test("run graph loads without infinite loop / client crash", async ({ page }) => {
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));
  await page.goto("/runs/run_pipeline_ops/graph", { waitUntil: "networkidle" });
  await expect(page.getByTestId("run-graph")).toBeVisible({ timeout: 20000 });
  await expect(page.locator(".react-flow__node").first()).toBeVisible({ timeout: 20000 });
  await page.waitForTimeout(3500);
  expect(pageErrors, pageErrors.join("\n")).toEqual([]);
  // toggle mode — should not explode
  await page.getByTestId("graph-mode-expanded").click();
  await page.waitForTimeout(1500);
  await page.getByTestId("graph-mode-aggregated").click();
  await page.waitForTimeout(1500);
  expect(pageErrors, pageErrors.join("\n")).toEqual([]);
});
