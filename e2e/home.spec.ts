import { expect, test } from "@playwright/test";

test("home page renders the hero and primary CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Revolver Roofing/);
  await expect(page.getByRole("heading", { level: 1, name: /roofs that last/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /get a free estimate/i })).toBeVisible();
});
