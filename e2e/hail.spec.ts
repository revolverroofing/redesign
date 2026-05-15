import { expect, test } from "@playwright/test";

test("hail console renders the dashboard and switches to the map", async ({ page }) => {
  await page.goto("/hail");

  await expect(page).toHaveTitle(/Texas hail console/);
  await expect(
    page.getByRole("heading", { level: 1, name: /dashboard/i }),
  ).toBeVisible();

  await page.getByRole("tab", { name: /map/i }).click();
  await expect(
    page.getByRole("img", { name: /map of texas/i }),
  ).toBeVisible();
});
