# AGENTS.md

Guidance for AI agents working on this codebase.

## When Changing Scaffold Behavior

Changes to prompts, templates, or config flow usually touch multiple files. Update them together:

1. **Schema** (`cli/src/core/schema.ts`) – Add or change types, Zod schemas.
2. **Prompts** (`cli/src/commands/create/prompts.ts`) – Collect user input; pass validated config.
3. **Manifest** (`cli/src/template/manifest.ts`) – Map config to template assets and variables.
4. **Templates** (`cli/template/frameworks/playwright/`) – Add or edit `.tpl` files.
5. **Smoke tests** (`tests/scaffold-smoke.ts`) – Add or adjust cases for new configs.

## Minimal vs Advanced POM

- **Minimal**: Skips reporting and CI prompts; Zod defaults to No; `totalSteps` is 2.
- **Advanced**: Shows reporting (HTML/Allure) and CI workflow prompts; Zod defaults to Yes; `totalSteps` is 4.

When adding prompts or steps, gate them with `pomTemplate === "minimal"` (skip for minimal) or `pomTemplate === "advanced"` (run only for advanced). Keep `totalSteps` correct for each path.

## Where to Look

- **Prompt flow and config collection**: `cli/src/commands/create/prompts.ts`
- **Scaffolding and install**: `cli/src/commands/create/index.ts`
- **Template selection and variables**: `cli/src/template/manifest.ts`
- **New template files**: `cli/template/frameworks/playwright/architectures/pom/`
- **Dependency resolution**: `cli/src/core/version-resolver.ts`, `cli/src/commands/create/index.ts` (getPlaywrightDependencyPackages)

## Rules

- Validate all prompt-derived config through Zod before use.
- Keep template logic deterministic; no side effects in manifest or renderer.
- New prompt options must have corresponding schema fields and manifest handling.
- Generated projects must run without manual edits.
- Do not add prompt options that cannot be fully scaffolded.

## Testing Quality

- Avoid unnecessary `await` usage in tests, especially before `expect(...).resolves` and `expect(...).rejects` chains.
- Aim for full test coverage of the behavior you add or change. Cover all meaningful branches and variants, not just the default path.
- If a test no longer validates real behavior after a code change, update or remove it instead of keeping stale coverage around.

## Before Finishing

Run `bun run check` and `bun run build`. For prompt or scaffold changes, run `bun run dev` to verify the flow.
