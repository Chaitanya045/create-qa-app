# create-qa-app Roadmap

## Phase 1: Core Project Scaffolding
- Goal: Produce a usable starter project from a guided CLI flow.
- Choices:
  - Framework: Playwright
  - Template: Minimal or Advanced POM
  - Optional dependency installation
- Output:
  - TypeScript-first project
  - Zod runtime validation example
  - Allure reporting integration
  - Starter tests aligned to architecture choice

## Phase 2: Testing Domain Selection
- Goal: Support user intent at project creation time.
- Add:
  - Testing type: UI, API, or hybrid
  - Framework-specific API setup patterns
  - Initial service/page abstraction templates

## Phase 3: BDD and Spec Styles
- Goal: Add behavior-driven options while keeping architecture maintainable.
- Add:
  - BDD mode toggle
  - Cucumber for Playwright
  - Feature files, step definition templates, and typed world/context

## Phase 4: Advanced Framework Options
- Goal: Support ecosystem choices beyond default test runners.
- Add:
  - Karate starter option
  - Extensible adapter system for additional tools
  - Template capability matrix and compatibility checks

## Phase 5: Reporting and Quality Gates
- Goal: Standardize diagnostics and visibility out of the box.
- Add:
  - Rich reporter presets (Allure + HTML + JUnit)
  - Retry/flaky-test policies
  - Coverage and contract-style reporting hooks

## Phase 6: CI/CD and Project Policies
- Goal: Make projects production-ready at generation time.
- Add:
  - GitHub Actions/GitLab CI templates
  - Caching strategy by package manager
  - Lint/type/test gate defaults and quality thresholds
