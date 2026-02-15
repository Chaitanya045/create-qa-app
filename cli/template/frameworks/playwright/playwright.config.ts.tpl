import { defineConfig } from "@playwright/test";
import { env } from "./src/config/env";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: [["line"], ["html", { open: "never" }], ["allure-playwright"]],
  use: {
    baseURL: env.BASE_URL,
    trace: "on-first-retry"
  }
});
