import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

export async function createTempDir(prefix: string): Promise<string> {
  return await mkdtemp(path.join(tmpdir(), prefix));
}

export async function removeTempDir(dir: string): Promise<void> {
  await rm(dir, { recursive: true, force: true });
}

export async function writeTextFile(
  rootDir: string,
  relativePath: string,
  content: string
): Promise<string> {
  const absolutePath = path.join(rootDir, relativePath);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content, "utf8");
  return absolutePath;
}

export async function readTextFiles(rootDir: string): Promise<Record<string, string>> {
  const files: Record<string, string> = {};

  async function visit(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await visit(absolutePath);
        continue;
      }

      const relativePath = path.relative(rootDir, absolutePath).replace(/\\/g, "/");
      files[relativePath] = await readFile(absolutePath, "utf8");
    }
  }

  await visit(rootDir);
  return files;
}
