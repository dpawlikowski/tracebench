import { test, expect } from "@playwright/test";

test.describe("Tracebench critical path", () => {
  test("open run → replay → approve high-risk → audit updates", async ({ page }) => {
    await page.goto("/runs/run_live_approve");

    await expect(page.getByRole("heading", { name: /Emergency ledger top-up/i })).toBeVisible();

    // Replay control present; timeline mounts
    await expect(page.getByTestId("replay-btn")).toBeVisible();
    await expect(page.getByTestId("timeline")).toBeVisible();

    // Wait for streaming / approval gate
    await expect(page.getByTestId("approval-gate")).toBeVisible({ timeout: 20_000 });

    // Optional: ensure at least one timeline event appeared (replay may still be going)
    await page.getByTestId("show-all-btn").click();
    await expect(page.locator("[data-testid^='timeline-event-']").first()).toBeVisible();

    // Open high-risk approval modal
    const review = page.getByTestId("open-approval-ap_lv_2");
    await expect(review).toBeVisible();
    await review.click();

    const modal = page.getByTestId("approval-modal");
    await expect(modal).toBeVisible();
    await expect(modal.getByText(/execute_payment/i)).toBeVisible();

    // Keyboard: Escape closes, reopen
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    await review.click();
    await expect(modal).toBeVisible();

    // Approve
    await page.getByTestId("modal-approve").click();

    // Modal closes; status moves off awaiting
    await expect(modal).toBeHidden({ timeout: 10_000 });
    await expect(page.getByText(/succeeded/i).first()).toBeVisible({ timeout: 10_000 });

    // Audit log updated with human approval
    const audit = page.getByTestId("audit-log");
    await expect(audit).toBeVisible();
    await expect(audit.getByText(/execute_payment approved/i)).toBeVisible();
    await expect(audit.locator('[data-audit-type="approval.approved"]').first()).toBeVisible();
  });

  test("runs list and evals scorecard load", async ({ page }) => {
    await page.goto("/runs");
    await expect(page.getByRole("heading", { name: /Agent runs/i })).toBeVisible();
    await expect(page.getByTestId("run-row-run_live_approve")).toBeVisible();
    await expect(page.getByTestId("runs-table")).toBeVisible();

    await page.goto("/evals");
    await expect(page.getByRole("heading", { name: /Eval \/ release gate/i })).toBeVisible();
    await expect(page.getByTestId("eval-table")).toBeVisible();
    await expect(page.getByText(/eval_001/i).first()).toBeVisible();
  });

  test("command palette and density prefs", async ({ page }) => {
    await page.goto("/runs");
    await expect(page.getByTestId("run-row-run_live_approve")).toBeVisible();

    await page.getByTestId("open-command-palette").click();
    await expect(page.getByTestId("command-palette")).toBeVisible();
    await expect(page.getByText(/↑↓ navigate/i)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("command-palette")).toBeHidden();

    await page.getByTestId("density-toggle").click();
    await expect(page.locator("html")).toHaveAttribute("data-density", /dense|comfortable/);
  });
});
