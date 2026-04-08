---
name: pr-description-writer
description: Generate pull request titles and descriptions from branch diffs, commit history, and repo conventions. Use when the user asks to write, improve, shorten, or format a PR description, summarize a branch for reviewers, turn git changes into a GitHub PR body, or prepare reviewer-facing testing notes, risks, and follow-ups.
---

# Pr Description Writer

Turn a branch's full change set into a reviewer-facing PR title and body. Keep the write-up grounded in actual diffs, follow any repository template when present, and optimize for review clarity rather than implementation trivia.

## Workflow

1. Collect source material.
- Review the full branch diff against the base branch, not just the latest commit.
- Read recent commits to understand intent and how the branch evolved.
- Check for an existing PR template or contribution guidance before choosing a format.
- If the user already supplied a summary or draft, treat it as input, then verify it against the code when possible.

2. Distill the branch into review themes.
- Identify the problem being solved and the visible outcome.
- Group related changes together instead of listing files one by one.
- Capture testing, migrations, rollout notes, reviewer hotspots, and intentionally deferred work.

3. Draft the title and body.
- Follow the repository template if one exists.
- Otherwise use the default structure from `references/templates.md`.
- Keep the title short, specific, and reviewer-facing.
- Prefer a conventional title format when the repository uses it, such as `feat(scope): ...`, `fix(scope): ...`, `refactor(scope): ...`, or `chore(scope): ...`.
- Keep bullets parallel, concrete, and focused on why the change matters.

4. Sanity-check the draft.
- Remove low-value implementation detail that does not help review.
- Do not claim tests that were not run.
- Call out breaking changes, config changes, data migrations, or manual steps explicitly.
- If the base branch or validation status is unclear, say so or ask instead of guessing.

## Decision Rules

- Existing template: preserve it.
- Small change: use 2-3 summary bullets.
- Large change: group bullets by feature area, workflow, or reviewer concern.
- Refactor-only change: explain why the refactor matters, not just that code moved.
- No tests run: say `Not run` or explain why testing was not needed.
- Higher-risk change: add a short `## Risks`, `## Notes`, or `## Follow-ups` section.

## Writing Rules

- Lead with intent and reviewer impact.
- Prefer concrete verbs like `add`, `fix`, `improve`, and `refactor`.
- Mention subsystem or file names only when they help reviewers orient themselves.
- Keep sections concise and scannable.
- Avoid filler such as `misc updates`, `changes`, or `cleanup` without context.

## Default Output

If the repository does not provide a PR template, use this structure:

```md
## Summary
- ...
- ...

## Testing
- ...
```

Add `## Risks`, `## Notes`, or `## Follow-ups` only when they help reviewers.

## Title Guidance

- Prefer conventional PR titles when the repository history uses them.
- Use lowercase type prefixes such as `feat`, `fix`, `refactor`, `chore`, or `docs`.
- Add a scope when it clarifies the area, for example `feat(skills): add PR description writer skill`.
- After the colon, use a short action-oriented summary in sentence case or lowercase, matching repo history.
- Fall back to a plain verb-led title only when the repository does not appear to use conventional titles.
- Keep titles narrow enough that a reviewer can infer scope before opening the PR.

## Examples

Read `references/templates.md` when you need example titles and bodies for feature work, bug fixes, refactors, or infrastructure changes.
