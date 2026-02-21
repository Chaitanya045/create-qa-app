import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import playwright from "eslint-plugin-playwright";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [".auth/**", "dist/**", "playwright-report/**", "allure-results/**", "allure-report/**"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    files: ["{{playwrightTestDirectory}}/**/*.ts"],
    ...playwright.configs["flat/recommended"]
  }
];
