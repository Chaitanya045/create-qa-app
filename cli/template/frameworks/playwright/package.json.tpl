{
  "name": "{{packageName}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed",
    "lint": "eslint . --max-warnings=0",
    "lint:fix": "eslint . --fix",
    "format": "prettier . --write",
    "format:check": "prettier . --check"{{playwrightHtmlScriptLine}}{{playwrightAllureScriptLine}}
  },
  "devDependencies": {
    "@playwright/test": "{{versionPlaywrightTest}}",
    "@types/node": "{{versionTypesNode}}",
    "@eslint/js": "{{versionEslintJs}}",
    "eslint": "{{versionEslint}}",
    "eslint-config-prettier": "{{versionEslintConfigPrettier}}",
    "eslint-plugin-playwright": "{{versionEslintPluginPlaywright}}",
    "prettier": "{{versionPrettier}}",
    "typescript": "{{versionTypescript}}",
    "typescript-eslint": "{{versionTypescriptEslint}}"{{playwrightZodDependencyLine}}{{playwrightAllurePlaywrightDependencyLine}}{{playwrightAllureCommandlineDependencyLine}}
  }
}
