import { test, expect } from "@playwright/test";
import { HomePage } from "{{playwrightPomPageImportPath}}";

test("home smoke test", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await expect(homePage.formAuthenticationLink()).toBeVisible();
});
