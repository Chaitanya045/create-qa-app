# create-qa-app

`create-qa-app` scaffolds automation-testing projects with strong TypeScript defaults, architecture choices, and reporting hooks.

## Local Development

```bash
bun install
bun run check
bun run dev
```

## Build CLI

```bash
bun run build
```

This produces `dist/index.js` for the `create-qa-app` executable.

## Current Scope (Phase 1)

- Project prompts:
  - Project name
  - Framework (Playwright/Cypress)
  - Architecture (POM/Feature Driven)
  - Package manager (npm/pnpm/yarn/bun)
  - Runtime validation (Zod: Yes (Recommended) / No)
  - Install dependencies
- Generates a starter project with:
  - TypeScript config
  - Test framework setup
  - Zod-based environment parsing
  - Allure reporting setup
  - Starter tests following selected architecture

## Roadmap

See `/Users/chaitanya/Work/create-qa-app/docs/PHASES.md` for phase-by-phase expansion (UI/API modes, BDD/Cucumber/Karate, advanced reporting, plugins, CI templates).
