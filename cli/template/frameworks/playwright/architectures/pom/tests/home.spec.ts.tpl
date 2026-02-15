import { test } from "@playwright/test";
import { HomePage } from "../src/pages/home.page";

test("home smoke test", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await homePage.expectGettingStartedLink();
});
