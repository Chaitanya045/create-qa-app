# PR Templates And Examples

Use these patterns when the repository does not already define its own PR template.

## Default Template

```md
## Summary
- State the problem or goal.
- Describe the main behavior or structural change.
- Call out reviewer hotspots, migrations, or other notable details when relevant.

## Testing
- <command or manual verification>
```

## Optional Sections

- `## Risks` for rollout concerns, breaking changes, or reviewer caution points.
- `## Notes` for context that helps review but does not belong in the summary.
- `## Follow-ups` for intentionally deferred work.

## Fact Checklist

- Review the full branch diff, not only the latest commit.
- Confirm the base branch before describing scope.
- List only the tests that actually ran.
- Call out migrations, config changes, or manual rollout steps.
- Keep bullets grouped by theme instead of by file.

## Example: Feature

Title:

```text
Add advanced POM reporting and CI scaffold prompts
```

Body:

```md
## Summary
- add advanced Playwright scaffold prompts for reporting and CI workflow generation
- thread the new prompt values through validation and template selection so generated projects include the requested assets
- expand smoke coverage for the advanced path so the new configuration stays scaffoldable end to end

## Testing
- bun run check
- bun run build
```

## Example: Bug Fix

Title:

```text
Fix version resolver fallback for Playwright packages
```

Body:

```md
## Summary
- fix dependency resolution when the preferred Playwright version cannot be resolved from the configured source
- keep scaffold output deterministic by falling back to the supported package mapping instead of failing late in generation
- add coverage for the fallback path to prevent regressions

## Testing
- bun run check
- bun run build
```

## Example: Refactor

Title:

```text
Refactor create command prompt flow for POM variants
```

Body:

```md
## Summary
- simplify the create-command prompt branching for minimal and advanced POM flows
- keep the step count and skip logic aligned with the selected template so the CLI stays predictable
- preserve existing scaffold output while making future prompt changes easier to maintain

## Testing
- bun run check
- bun run build
```
