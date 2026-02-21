import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";
import { env } from "../config/env";
import { LoginPage } from "{{playwrightPomLoginPageImportPathFromStorageSetup}}";
import { SecurePage } from "{{playwrightPomSecurePageImportPathFromStorageSetup}}";

const STORAGE_STATE_PATH = ".auth/storageState.json";

export default async function globalSetup(): Promise<void> {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    baseURL: env.BASE_URL{{playwrightUserAgentContextOption}}{{playwrightLocaleContextOption}}
  });
  const page = await context.newPage();

  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginWithEnv();

  const securePage = new SecurePage(page);
  await securePage.expectLoggedIn();

  await mkdir(path.dirname(STORAGE_STATE_PATH), { recursive: true });
  await context.storageState({ path: STORAGE_STATE_PATH });

  await browser.close();
}

