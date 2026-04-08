---
name: pr-description-generator
description: Generate a copy-pastable GitHub PR description by comparing the current git branch against main or origin/main. Use when preparing a PR in this repo and you want an accurate summary based on commit subjects, file diffs, and repo-specific testing commands.
---

# PR Description Generator

Generate a PR description from real git deltas so the PR body stays accurate and easy to review.

This repository uses `main` as the default base branch and usually uses conventional PR titles like `feat(scope): ...` or `fix(scope): ...`. The generator defaults to `origin/main`, falls back to `main`, and uses the first commit subject as the title unless you override it.

If the branch contains follow-up fixups and the first commit subject is not the right PR title, pass `--title` with a conventional title for the full branch.

## Quick Start

```bash
node .agents/skills/pr-description-generator/scripts/generate_pr_description.mjs
```

## Options

- Use a different base branch:

```bash
node .agents/skills/pr-description-generator/scripts/generate_pr_description.mjs --base main
node .agents/skills/pr-description-generator/scripts/generate_pr_description.mjs --base origin/main
```

- Provide an explicit title:

```bash
node .agents/skills/pr-description-generator/scripts/generate_pr_description.mjs --title "feat(skills): add PR description generator"
```

- Avoid fetching when offline or when remote access is not needed:

```bash
node .agents/skills/pr-description-generator/scripts/generate_pr_description.mjs --no-fetch
```

## Output Contract

The script prints exactly one fenced markdown block that you can copy into GitHub.

- `# <title>`: derived from the first commit subject or `--title`
- `## Summary`: 3-6 bullets inferred from commit subjects
- `## Changes`: changed files (name-status) plus diffstat
- `## Testing`: repo-aware commands like `bun run check` and `bun run build`
- `## Notes`: low-volume repo-specific hints when needed

## Repo Behavior

- Use `origin/main` by default and fall back to `main`.
- Suggest `bun run check` and `bun run build` when those scripts exist.
- Suggest `bun run dev` when scaffold-related files are touched, matching the repo guidance in `AGENTS.md`.
- Add a note when packaged `.skill` artifacts are included so reviewers notice the source and packaged files move together.
