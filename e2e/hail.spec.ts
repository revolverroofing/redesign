import { expect, test } from "@playwright/test";

test("hail tracker page renders the map and filters", async ({ page }) => {
  await page.goto("/hail");

  await expect(page).toHaveTitle(/Hail tracker/);
  await expect(
    page.getByRole("heading", { level: 2, name: /tri-state hail map/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: /map of the tri-state area/i }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^severe$/i }),
  ).toBeVisible();
});
