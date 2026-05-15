import { expect, test } from "@playwright/test";

test("lead form happy path returns the success state", async ({ page }) => {
  await page.goto("/#contact");

  await page.getByLabel(/^name$/i).fill("Jane Customer");
  await page.getByLabel(/^phone$/i).fill("(555) 555-0123");
  await page.getByLabel(/email/i).fill("jane@example.com");
  await page.getByLabel(/property address/i).fill("123 Elm St");
  await page.getByLabel(/what do you need/i).selectOption("residential");
  await page.getByLabel(/anything we should know/i).fill("Leak above the porch");

  await page.getByRole("button", { name: /request an estimate/i }).click();

  await expect(page.getByRole("status")).toContainText(/thanks/i);
});

test("lead form surfaces validation errors for missing fields", async ({ page }) => {
  await page.goto("/#contact");

  // Submit without filling anything — server-side validation should fire
  // (HTML required attributes are bypassed by `noValidate`).
  await page.getByRole("button", { name: /request an estimate/i }).click();

  await expect(page.getByRole("alert")).toContainText(/highlighted fields/i);
});
