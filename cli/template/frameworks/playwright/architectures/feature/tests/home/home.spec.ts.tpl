import { test, expect } from "@playwright/test";
import { HomeFeature } from "./home.page";

test("home feature smoke test", async ({ page }) => {
  const homeFeature = new HomeFeature(page);
  await homeFeature.visitHome();
  await expect(homeFeature.formAuthenticationLink()).toBeVisible();
});
