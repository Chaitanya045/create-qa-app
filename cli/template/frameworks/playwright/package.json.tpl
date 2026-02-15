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
    "report:html": "playwright show-report",
    "report:allure": "allure generate allure-results --clean && allure open"
  },
  "devDependencies": {
    "@playwright/test": "latest",
    "allure-commandline": "latest",
    "allure-playwright": "latest",
    "typescript": "latest",
    "zod": "latest"
  }
}
