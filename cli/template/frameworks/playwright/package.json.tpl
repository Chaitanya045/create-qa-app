{
  "name": "{{packageName}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "prepare": "husky || true",
    "typecheck": "tsc --noEmit",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check"{{playwrightHtmlScriptLine}}{{playwrightAllureScriptLine}}
  },
  "lint-staged": {
    "*.{ts,tsx,js,mjs,cjs}": [
      "prettier --write --ignore-unknown",
      "eslint --fix --max-warnings=0"
    ],
    "*.{json,md,yml,yaml}": [
      "prettier --write --ignore-unknown"
    ]
  },
  "devDependencies": {
    "@playwright/test": "{{versionPlaywrightTest}}",
    "@types/node": "{{versionTypesNode}}",
    "dotenv": "{{versionDotenv}}",
    "@eslint/js": "{{versionEslintJs}}",
    "eslint": "{{versionEslint}}",
    "eslint-config-prettier": "{{versionEslintConfigPrettier}}",
    "eslint-plugin-playwright": "{{versionEslintPluginPlaywright}}",
    "husky": "{{versionHusky}}",
    "lint-staged": "{{versionLintStaged}}",
    "prettier": "{{versionPrettier}}",
    "typescript": "{{versionTypescript}}",
    "typescript-eslint": "{{versionTypescriptEslint}}"{{playwrightZodDependencyLine}}{{playwrightAllurePlaywrightDependencyLine}}{{playwrightAllureCommandlineDependencyLine}}
  }
}
