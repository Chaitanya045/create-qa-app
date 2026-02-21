{
  "name": "{{packageName}}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "cypress run",
    "test:open": "cypress open",
    "report:allure": "allure generate allure-results --clean && allure open"
  },
  "devDependencies": {
    "@types/node": "latest",
    "@shelex/cypress-allure-plugin": "latest",
    "allure-commandline": "latest",
    "cypress": "latest",
    "typescript": "latest"
  }
}
