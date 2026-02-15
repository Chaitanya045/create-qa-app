# AGENTS.md

## Purpose
This repository builds `create-qa-app`, a CLI that scaffolds maintainable, type-safe automation testing projects.

## Product Direction
- Prioritize long-term maintainability over quick scaffolding hacks.
- Keep generated projects strongly typed (TypeScript + Zod validation patterns).
- Keep the CLI experience consistent, minimal, and predictable.

## Code Structure
- `cli/src/index.ts`: top-level CLI entrypoint and command routing.
- `cli/src/commands/create/*`: create command flow and interactive prompts.
- `cli/src/cli/*`: prompt/loading wrappers.
- `cli/src/core/schema.ts`: shared typed config contract.
- `cli/src/template/*`: template manifests and template resolution logic.
- `cli/src/core/scaffold.ts`: filesystem creation logic.
- `cli/src/core/package-manager.ts`: package manager detection/commands.
- `cli/src/core/install.ts`: dependency installation runner.

## Implementation Rules
- Keep template logic deterministic and side-effect free.
- Prefer explicit types and narrow unions for new prompt options.
- Validate all prompt-derived config through Zod schemas.
- When adding or changing scaffold modes, update schema types, prompt options, and template mappings together.
- Do not introduce framework-specific assumptions into shared utilities unless guarded by framework checks.
- Keep generated project defaults runnable without manual file edits.
- Avoid hidden or partial options in prompts; expose only combinations that scaffold correctly.

## Quality Gates
Before finishing a change, run:

```bash
bun run check
bun run build
```

For behavior changes, also run:

```bash
bun run dev
```
