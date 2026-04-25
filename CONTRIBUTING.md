# Contributing

## Development Setup

This repository uses [`mise`](https://mise.jdx.dev/) to pin the Bun and Node versions used locally and in CI.

1. Install `mise` by following the official getting started guide: <https://mise.jdx.dev/getting-started.html>
2. Clone the repository and move into it:

```bash
git clone https://github.com/Chaitanya045/create-qa-app.git
cd create-qa-app
```

3. Trust the checked-in `mise.toml` file:

```bash
mise trust
```

If `mise install` reports that the config is not trusted yet, run `mise trust` in the repository root and retry.

4. Install the pinned tools:

```bash
mise install
```

5. Install project dependencies:

```bash
bun install
```

If your shell is configured with `mise activate`, the pinned tools will be used automatically in this repository. If you do not use shell activation, you can still run the project tasks with `mise run <task>`.

## Common Commands

- `mise run deps` installs project dependencies with Bun.
- `mise run check` runs typecheck, lint, and format verification.
- `mise run test` runs the Bun unit test suite.
- `mise run build` builds the CLI bundle.
- `mise run smoke` scaffolds sample projects and verifies they install and typecheck.
- `mise run dev` starts the interactive scaffold CLI.

The equivalent Bun commands continue to work if you prefer them:

- `bun run check`
- `bun run test`
- `bun run build`
- `bun run smoke`
- `bun run dev`

## Before Opening a PR

Run the commands that cover the area you changed:

- Always run `mise run check`, `mise run test`, and `mise run build`.
- Run `mise run smoke` when you change scaffolding, templates, manifests, or docs that describe generated output.
- Run `mise run dev` when you change prompt flow or interactive scaffold behavior.

## Notes for Scaffold Changes

- Update prompts, schema, manifest logic, templates, and smoke coverage together when scaffold behavior changes.
- Keep generated projects runnable without manual edits beyond expected environment or secret setup.
- Add or update tests when behavior changes, and remove tests that no longer validate real behavior.
