import { test, expect } from "{{playwrightPomFixtureImportPath}}";

test("reuses login session", async ({ securePage }) => {
  await securePage.goto();
  await expect(securePage.header()).toBeVisible();
});

