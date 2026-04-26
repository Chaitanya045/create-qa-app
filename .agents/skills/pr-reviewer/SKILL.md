---
name: pr-reviewer
description: Review pull requests in this repository with a code-review mindset focused on bugs, security, scaffold regressions, and missing coverage. Use when analyzing a branch or PR in create-qa-app and you need a repo-specific checklist for generated-project safety, prompt/schema/manifest/template drift, workflow regressions, secrets exposure, path traversal, and test completeness.
---

# PR Reviewer

Review PRs in this repository for correctness first. Prioritize bugs, security issues, behavioral regressions, and missing tests over style nits.

## Workflow

1. Collect the delta against `main` or `origin/main`.
2. Read the changed files that affect behavior, not just the latest commit.
3. Check the repo-specific vulnerability and regression classes below.
4. Verify tests and coverage expectations for the changed behavior.
5. Report findings first, ordered by severity, with file references.
6. If reviewing a GitHub PR, leave review comments on concrete issues when the change author would benefit from line-level guidance.

## Repo-Specific Review Checks

### 1. Secret leakage

Check for:

- real credentials or tokens committed into `.env`, docs, templates, workflows, or tests
- generated examples that encourage committing secrets instead of using `.env.example` or CI secrets
- workflow changes that expose sensitive values in plaintext

### 2. Path traversal and unsafe writes

Check for:

- prompt, schema, or scaffold changes that allow `../`, absolute paths, or unsafe project names
- path joins that can escape the scaffold target directory
- writes that are no longer constrained to generated project boundaries

### 3. Prompt/schema/manifest/template drift

This repo expects scaffold behavior changes to update all related layers together.

Check for:

- prompt options added without schema support
- schema fields added without manifest or template handling
- template placeholders added without manifest variables
- manifest branches added without matching prompt or schema logic

### 4. Minimal vs advanced regressions

Check for:

- minimal POM showing advanced-only prompts or steps
- advanced POM skipping reporting or CI/tooling paths
- `totalSteps` no longer matching the active branch
- defaults drifting from the repo guidance in `AGENTS.md`

### 5. Generated project not runnable

Check for:

- missing files, broken imports, or wrong output locations in generated projects
- dependency/template mismatches that break `bun install`, `typecheck`, or scaffold smoke
- changes that require manual edits before the generated project can run

### 6. `src` vs non-`src` layout regressions

Check for:

- incorrect relative imports when `useSrcLayout` changes
- assets still generated to `src/` when root layout is selected, or vice versa
- tests only covering one layout while the other branch changed too

### 7. Nondeterministic scaffolding

Check for:

- side effects or environment-sensitive logic inside manifest or renderer code
- output that can vary unexpectedly between runs
- hidden dependence on local machine state in scaffold logic

### 8. Unsafe or invalid command execution

Check for:

- command construction bugs across `npm`, `pnpm`, `yarn`, and `bun`
- shell-sensitive command strings that can break on different platforms
- install or Playwright browser commands that drift from the generated docs or behavior

### 9. Dependency/version resolution drift

Check for:

- generated dependencies added without version resolution support
- fallbacks to `latest` hiding actual breakage
- package template updates that do not match resolved version variables

### 10. CI/workflow regressions

Check for:

- duplicate or missing workflow triggers
- local setup and CI using different toolchain assumptions
- generated workflow templates diverging from actual repo expectations
- publish/setup steps breaking due to workflow edits

### 11. Environment/config safety regressions

Check for:

- `.env` handling that encourages secrets in git
- `.env.example` drifting from actual required variables
- validation changes that make generated projects fail unnecessarily or stop validating required envs

### 12. Stale, missing, or misleading tests

This repo expects full coverage for changed behavior and removal/update of stale tests.

Check for:

- changed behavior without unit test updates
- scaffold changes without `tests/scaffold-smoke.ts` updates when needed
- tests that no longer validate real behavior after code changes
- coverage that only exercises the default path while other meaningful branches changed

## Expected Verification

Recommend the repo commands that match the change surface:

- Always expect `bun run check` and `bun run build`.
- Expect `bun run test` when core CLI logic or helpers change.
- Expect `bun run smoke` when scaffold output, templates, manifests, generated docs, or generated workflows change.
- Expect `bun run dev` when prompt flow or interactive scaffold behavior changes.

## Output Format

Return findings first.

Use this structure:

1. `severity` - `path:line` - concise finding title
2. One or two sentences on why it is a problem and what behavior is at risk.

After findings, include:

- `Open questions` only if a decision is ambiguous.
- `Residual risks` for untested or weakly covered areas.
- `No findings` explicitly when nothing actionable is found.

Keep summaries brief. The review should primarily help catch regressions and vulnerabilities before merge.

## GitHub PR Comments

When reviewing a GitHub PR, add comments only for actionable findings or clarifying questions.

Prefer:

- one comment per issue
- specific file/line context
- direct explanation of the risk or regression
- a concise suggestion for what to change

Avoid leaving comments for:

- pure style preferences with no behavioral impact
- issues already covered by an existing unresolved review comment
- vague feedback without a concrete ask
