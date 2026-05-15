import { expect, test } from "@playwright/test";

test.describe("Service pages", () => {
  test("residential page renders content and back-link", async ({ page }) => {
    await page.goto("/services/residential");

    await expect(
      page.getByRole("heading", { level: 1, name: /residential roofing/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /all services/i })).toHaveAttribute(
      "href",
      "/#services",
    );
  });

  test("unknown service slug returns the branded 404", async ({ page }) => {
    const response = await page.goto("/services/this-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1, name: /couldn.t find/i })).toBeVisible();
  });
});
