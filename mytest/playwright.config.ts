import { defineConfig } from "@playwright/test";
import { env } from "./src/config/env";

export default defineConfig({
  testDir: "./src/tests",
  fullyParallel: true,
  reporter: [["line"], ["html", { open: "never" }]],
  use: {
    baseURL: env.BASE_URL,
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "setup",
      testDir: "./src/storage-setup",
      testMatch: /.*\.setup\.ts/,
      use: {
        browserName: "chromium"
      }
    },
    {
      name: "chromium",
      testDir: "./src/tests",
      dependencies: ["setup"],
      use: {
        browserName: "chromium",
        storageState: ".auth/storagestate.json"
      }
    }
  ]
});
