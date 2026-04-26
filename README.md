# create-qa-app

Scaffold type-safe Playwright automation testing projects with Page Object Model (POM) architecture.

## Quick Start

```bash
npx create-qa-app
```

Follow the prompts to set up your project. You can also use `bunx create-qa-app` or `pnpm dlx create-qa-app`.

## Contributing

This repository uses `mise` to pin Bun and Node versions for local development and CI. See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full contributor setup and workflow.

## What You Get

Every generated project includes:

| Tool | Purpose |
|------|---------|
| **TypeScript** | Strict typing, ES modules |
| **Playwright** | End-to-end testing |
| **dotenv** | Auto-load local `.env` values |
| **ESLint** | Linting with TypeScript and Playwright best-practice rules |
| **Prettier** | Code formatting |
| **Husky** | Git hooks |
| **lint-staged** | Run checks only on staged files |
| **Zod** | Optional runtime validation for env vars |

### Pre-commit Checks (Husky + lint-staged)

On every `git commit`, Husky runs lint-staged, which:

- **TypeScript/JavaScript** (`.ts`, `.tsx`, `.js`, `.mjs`, `.cjs`) → Prettier format, then ESLint fix
- **Config/Markdown** (`.json`, `.md`, `.yml`, `.yaml`) → Prettier format

The commit succeeds only if all checks pass. Fixable issues are applied automatically; unfixable ones block the commit until you resolve them.

### Scripts

| Script | Description |
|--------|-------------|
| `typecheck` | TypeScript check |
| `test` | Run Playwright tests |
| `test:ui` | Playwright UI mode |
| `test:headed` | Run tests in headed browser |
| `lint` | Run ESLint |
| `lint:fix` | ESLint with auto-fix |
| `format` | Prettier format all files |
| `format:check` | Verify formatting |
| `report:html` | Open HTML report (if HTML reporter) |
| `report:allure` | Generate and open Allure report (if Allure) |

### Optional (Advanced template)

- **GitHub Actions** – CI workflow for running tests
- **Allure** – Rich HTML reports

## Minimal vs Advanced Template

### Minimal

Choose **Minimal** when you want a lightweight setup to get started quickly:

- **Quick setup** – Fewer prompts; fewer files
- **Learning** – Good for understanding the basics
- **Simple apps** – Small test suites, single-page flows
- **No CI** – You add your own later if needed

**Project structure (minimal):**

```
my-project/
├── .env.example
├── src/
│   ├── config/
│   │   └── env.ts
│   ├── pages/
│   │   └── home.page.ts
│   └── tests/
│       └── home.spec.ts
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc.json
├── .prettierignore
├── .husky/
│   └── pre-commit
├── .gitignore
└── package.json
```

### Advanced

Choose **Advanced** when you need a production-ready structure:

- **Larger suites** – Multiple pages, fixtures, shared utilities
- **Auth flows** – Login/session handling with storage state
- **Type safety** – Typed auth and test data
- **CI/CD** – Optional GitHub Actions workflow
- **Reporting** – HTML and/or Allure reporters

**Project structure (advanced):**

```
my-project/
├── .env.example
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── constants.ts
│   ├── pages/
│   │   ├── login.page.ts
│   │   └── secure.page.ts
│   ├── fixtures/
│   │   └── test.fixture.ts
│   ├── utils/
│   │   └── helpers.ts
│   ├── data/
│   │   └── test-data.ts
│   ├── types/
│   │   └── auth.ts
│   └── tests/
│       └── login.spec.ts
├── playwright.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc.json
├── .prettierignore
├── .husky/
│   └── pre-commit
├── .github/
│   └── workflows/
│       └── playwright.yml
├── .gitignore
└── package.json
```

*Note: If you choose "Keep everything under src? No", the structure is the same but `config`, `pages`, `fixtures`, `utils`, `data`, and `types` live at the project root instead of under `src/`.*

## Zod: Runtime Validation

Generated projects auto-load `.env` with `dotenv`, ship a tracked `.env.example`, and ignore real `.env` files so secrets stay out of git.

When prompted **"Use Zod for runtime validation?"**, you choose how environment variables (like `BASE_URL`, `USERNAME`, `PASSWORD`) are validated.

### With Zod (recommended for advanced)

- **Validates at startup** – Invalid env values fail fast with clear errors
- **Typed schema** – `Env` inferred from the schema
- **Defaults** – Safe defaults in one place

```ts
// env.ts
import "dotenv/config";

const envSchema = z.object({
  BASE_URL: z.url().default("https://example.com"),
  USERNAME: z.string().min(1).default("user"),
  PASSWORD: z.string().min(1).default("secret")
});
export const env = envSchema.parse(process.env);
```

### Without Zod (simpler for minimal)

- **Fewer dependencies** – No Zod in package.json
- **Plain parsing** – Manual validation and defaults
- **Lighter** – Good for quick setups

Choose **Yes** when you want stronger guarantees and typed schema. Choose **No** when you prefer minimal setup and fewer dependencies.

## Environment Files and Secrets

- Copy `.env.example` to `.env` and update the values for your environment.
- Generated projects load `.env` automatically when the shared env config is imported.
- `.env` and `.env.*` are ignored by git, while `.env.example` remains tracked.
- In CI, set `BASE_URL`, `USERNAME`, and `PASSWORD` through provider secrets instead of committing a real `.env` file.
