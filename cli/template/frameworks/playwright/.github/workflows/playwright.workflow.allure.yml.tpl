name: Playwright Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: {{playwrightWorkflowInstallCommand}}

      - name: Install Playwright Browsers
        run: {{playwrightInstallBrowsersWithDepsCommand}}

      - name: Run Playwright tests
        run: {{playwrightWorkflowTestCommand}}

      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - name: Generate Allure report
        if: always()
        run: |
          if [ -d allure-results ]; then
            {{playwrightWorkflowAllureGenerateCommand}}
          else
            echo "allure-results directory not found; skipping Allure generation."
          fi

      - name: Upload Allure report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: allure-report
          path: allure-report/
          if-no-files-found: ignore
          retention-days: 30
