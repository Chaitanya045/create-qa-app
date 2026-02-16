{
  "name": "{{packageName}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "playwright test",
    "test:ui": "playwright test --ui",
    "test:headed": "playwright test --headed"{{playwrightHtmlScriptLine}}{{playwrightAllureScriptLine}}
  },
  "devDependencies": {
    "@playwright/test": "{{versionPlaywrightTest}}",
    "@types/node": "{{versionTypesNode}}",
    "typescript": "{{versionTypescript}}"{{playwrightZodDependencyLine}}{{playwrightAllurePlaywrightDependencyLine}}{{playwrightAllureCommandlineDependencyLine}}
  }
}
