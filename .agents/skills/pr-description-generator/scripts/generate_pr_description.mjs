#!/usr/bin/env node

/*
  PR Description Generator

  Generates a copy-pastable markdown block containing:
  - Title (from first commit subject or override)
  - Summary bullets (deduped commit subjects)
  - Changes (name-status + diffstat)
  - Testing (repo-aware suggestions)
  - Notes (only when needed)
*/

import fs from "node:fs";
import process from "node:process";
import { spawnSync } from "node:child_process";

function runGit(args, { check = true } = {}) {
  const cp = spawnSync("git", args, {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"]
  });

  if (check && cp.status !== 0) {
    const err = new Error(cp.stderr?.trim() || `git ${args.join(" ")} failed`);
    err.exitCode = cp.status ?? 1;
    throw err;
  }

  return cp;
}

function gitOk(args) {
  try {
    runGit(args, { check: true });
    return true;
  } catch {
    return false;
  }
}

function detectBaseBranch(preferred) {
  const candidates = [preferred];
  if (preferred !== "origin/main") candidates.push("origin/main");
  if (preferred !== "main") candidates.push("main");

  for (const candidate of candidates) {
    if (gitOk(["rev-parse", "--verify", candidate])) return candidate;
  }

  throw new Error(
    `Cannot find base branch. Tried: ${candidates.join(", ")}. Fetch remotes or pass --base explicitly.`
  );
}

function ensureFetched(base, { noFetch }) {
  if (noFetch || !base.startsWith("origin/")) return;

  const [, remote, ...branchParts] = base.split("/");
  const branch = branchParts.join("/");
  if (!remote || !branch) return;

  runGit(["fetch", remote, branch], { check: false });
}

function currentBranch() {
  const cp = runGit(["branch", "--show-current"]);
  const branch = (cp.stdout || "").trim();
  return branch || "(detached)";
}

function repoRoot() {
  const cp = runGit(["rev-parse", "--show-toplevel"]);
  return (cp.stdout || "").trim();
}

function commitSubjects(base, head) {
  const cp = runGit(["log", "--reverse", "--no-merges", "--format=%s", `${base}..${head}`]);
  return (cp.stdout || "")
    .split(/\r?\n/)
    .map((subject) => subject.trim())
    .filter(Boolean);
}

function changedFiles(base, head) {
  const cp = runGit(["diff", "--name-status", `${base}...${head}`]);
  return (cp.stdout || "")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+$/, ""))
    .filter((line) => line.trim());
}

function diffstat(base, head) {
  const cp = runGit(["diff", "--stat", `${base}...${head}`]);
  return (cp.stdout || "").replace(/\s+$/, "");
}

function changedPaths(nameStatusLines) {
  return nameStatusLines
    .map((line) => {
      const parts = line.split("\t");
      return (parts[parts.length - 1] || "").trim();
    })
    .filter(Boolean);
}

function isScaffoldTouched(paths) {
  return paths.some(
    (filePath) =>
      filePath === "cli/src/core/schema.ts" ||
      filePath === "cli/src/commands/create/prompts.ts" ||
      filePath === "cli/src/template/manifest.ts" ||
      filePath === "cli/src/dev/scaffold-smoke.ts" ||
      filePath.startsWith("cli/template/frameworks/playwright/")
  );
}

function isSkillArtifactTouched(paths) {
  return paths.some(
    (filePath) => filePath.startsWith(".agents/skills/dist/") && filePath.endsWith(".skill")
  );
}

function guessTitle(subjects, branch) {
  if (subjects.length > 0) return subjects[0];
  return `PR: ${branch}`;
}

function normalizeSummaryBullet(subject) {
  return subject
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\(#\d+\)$/, "")
    .trim();
}

function summaryBullets(subjects) {
  if (subjects.length === 0) {
    return ["No commits found between base and HEAD (check base branch)."];
  }

  const bullets = [];
  const seen = new Set();

  for (const subject of subjects) {
    const bullet = normalizeSummaryBullet(subject);
    if (!bullet) continue;

    const key = bullet.toLowerCase();
    if (seen.has(key)) continue;

    seen.add(key);
    bullets.push(bullet);

    if (bullets.length >= 6) break;
  }

  return bullets;
}

function readPackageJson() {
  try {
    return JSON.parse(fs.readFileSync("package.json", "utf8"));
  } catch {
    return null;
  }
}

function suggestTestingCommands(paths) {
  const pkg = readPackageJson();
  const scripts = pkg?.scripts ?? {};
  const commands = [];

  if (scripts.check) commands.push("bun run check");
  if (scripts.build) commands.push("bun run build");
  if (isScaffoldTouched(paths) && scripts.dev) commands.push("bun run dev");
  if (commands.length === 0) commands.push("<add your local test command>");

  return [...new Set(commands)];
}

function renderMarkdown(pr) {
  const lines = [];

  lines.push(`# ${pr.title}`);
  lines.push("");
  lines.push("## Summary");
  for (const bullet of pr.summary) lines.push(`- ${bullet}`);

  lines.push("");
  lines.push("## Changes");
  if (pr.changedFiles.length > 0) {
    lines.push("Changed files:");
    lines.push("");
    lines.push("```text");
    lines.push(...pr.changedFiles);
    lines.push("```");
  } else {
    lines.push("- No file changes detected (check base branch).");
  }

  if (pr.diffstat) {
    lines.push("");
    lines.push("Diffstat:");
    lines.push("");
    lines.push("```text");
    lines.push(pr.diffstat);
    lines.push("```");
  }

  lines.push("");
  lines.push("## Testing");
  for (const command of pr.testing) lines.push(`- \`${command}\``);

  if (pr.notes.length > 0) {
    lines.push("");
    lines.push("## Notes");
    for (const note of pr.notes) lines.push(`- ${note}`);
  }

  lines.push("");
  lines.push("---");
  lines.push("");
  lines.push(`Base: \`${pr.base}\``);
  lines.push(`Head: \`${pr.head}\``);
  lines.push(`Branch: \`${pr.branch}\``);

  return `${lines.join("\n").replace(/\s+$/, "")}\n`;
}

function parseArgs(argv) {
  const out = {
    base: "origin/main",
    head: "HEAD",
    title: null,
    noFetch: false
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--base") out.base = argv[++i] || out.base;
    else if (arg === "--head") out.head = argv[++i] || out.head;
    else if (arg === "--title") out.title = argv[++i] || out.title;
    else if (arg === "--no-fetch") out.noFetch = true;
    else if (arg === "--help" || arg === "-h") out.help = true;
    else out.unknown = arg;
  }

  return out;
}

function printHelp() {
  process.stdout.write("Usage: generate_pr_description.mjs [options]\n\n");
  process.stdout.write("Options:\n");
  process.stdout.write("  --base <ref>     Base ref to compare (default: origin/main)\n");
  process.stdout.write("  --head <ref>     Head ref to compare (default: HEAD)\n");
  process.stdout.write("  --title <title>  Override PR title\n");
  process.stdout.write("  --no-fetch       Do not fetch the remote base branch\n");
  process.stdout.write("  -h, --help       Show help\n");
}

function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    printHelp();
    return 0;
  }

  if (args.unknown) {
    process.stderr.write(`error: unknown argument ${args.unknown}\n`);
    printHelp();
    return 2;
  }

  try {
    process.chdir(repoRoot());

    ensureFetched(args.base, { noFetch: args.noFetch });
    const base = detectBaseBranch(args.base);

    const branch = currentBranch();
    const subjects = commitSubjects(base, args.head);
    const changed = changedFiles(base, args.head);
    const paths = changedPaths(changed);
    const stat = diffstat(base, args.head);
    const summary = summaryBullets(subjects);

    const notes = [];
    if (isScaffoldTouched(paths)) {
      notes.push(
        "Touches scaffold-related files; include `bun run dev` in verification to match this repo's guidance."
      );
    }
    if (isSkillArtifactTouched(paths)) {
      notes.push(
        "Includes packaged `.skill` artifacts; keep the packaged output in sync with the source skill files."
      );
    }

    const title = args.title?.trim() ? args.title.trim() : guessTitle(subjects, branch);

    const markdown = renderMarkdown({
      title,
      base,
      head: args.head,
      branch,
      subjects,
      summary,
      changedFiles: changed,
      diffstat: stat,
      testing: suggestTestingCommands(paths),
      notes
    });

    process.stdout.write("```markdown\n");
    process.stdout.write(markdown);
    process.stdout.write("```\n");
    return 0;
  } catch (error) {
    process.stderr.write(`error: ${error?.message ? error.message : String(error)}\n`);
    return 2;
  }
}

process.exitCode = main();
