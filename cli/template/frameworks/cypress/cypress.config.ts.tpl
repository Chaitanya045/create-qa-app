import { defineConfig } from "cypress";
import allureWriter from "@shelex/cypress-allure-plugin/writer";
import { env } from "./cypress/support/env";

export default defineConfig({
  video: false,
  e2e: {
    baseUrl: env.BASE_URL,
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    setupNodeEvents(on, config) {
      allureWriter(on, config);
      return config;
    }
  }
});
