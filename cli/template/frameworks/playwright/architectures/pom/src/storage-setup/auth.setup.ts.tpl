import { mkdir } from "node:fs/promises";
import path from "node:path";
import { test } from "@playwright/test";
import { LoginPage } from "{{playwrightPomLoginPageImportPathFromStorageSetup}}";
import { SecurePage } from "{{playwrightPomSecurePageImportPathFromStorageSetup}}";

const STORAGE_STATE_PATH = ".auth/storageState.json";

test("auth storage setup", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithEnv();

  const securePage = new SecurePage(page);
  await securePage.expectLoggedIn();

  await mkdir(path.dirname(STORAGE_STATE_PATH), { recursive: true });
  await page.context().storageState({ path: STORAGE_STATE_PATH });
});

