import { test, expect } from "{{playwrightPomFixtureImportPath}}";

test("example smoke test", async ({ examplePage }) => {
  await examplePage.goto();
  await expect(examplePage.getGettingStartedLink()).toBeVisible();
});

