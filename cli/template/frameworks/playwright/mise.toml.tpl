[tools]
{{playwrightMiseTools}}

[tasks.deps]
description = "Install project dependencies"
run = "{{installCommand}}"

[tasks.typecheck]
description = "Run TypeScript type checking"
run = "{{typecheckCommand}}"

[tasks.test]
description = "Run Playwright tests"
run = "{{playwrightRunTestsCommand}}"

[tasks.lint]
description = "Run lint checks"
run = "{{lintCommand}}"

[tasks.format]
description = "Format project files"
run = "{{formatCommand}}"

[tasks.playwright-install]
description = "Install Playwright browsers"
run = "{{playwrightInstallBrowsersCommand}}"
