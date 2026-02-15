import { existsSync } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { CliConfig } from "./schema";
import { createTemplateManifest } from "../template/manifest";
import { renderTemplateAsset } from "../template/renderer";

export type ScaffoldResult = {
  targetDir: string;
  createdFiles: number;
};

function resolveTemplateRoot(): string {
  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const candidates = [
    path.resolve(moduleDir, "../../template"),
    path.resolve(moduleDir, "../cli/template"),
    path.resolve(moduleDir, "../template")
  ];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error("Unable to locate the template directory.");
}

async function assertTargetDirIsScaffoldable(targetDir: string): Promise<void> {
  try {
    const entries = await readdir(targetDir);
    if (entries.length > 0) {
      throw new Error(`Target directory "${path.basename(targetDir)}" already exists and is not empty.`);
    }
  } catch (error) {
    const typedError = error as NodeJS.ErrnoException;
    if (typedError.code === "ENOENT") {
      return;
    }

    throw error;
  }
}

export async function scaffoldProject(baseDir: string, config: CliConfig): Promise<ScaffoldResult> {
  const targetDir = path.resolve(baseDir, config.projectName);
  await assertTargetDirIsScaffoldable(targetDir);
  await mkdir(targetDir, { recursive: true });

  const templateManifest = createTemplateManifest(config);
  const templateRoot = resolveTemplateRoot();

  await Promise.all(
    templateManifest.assets.map(async (templateAsset) => {
      const absolutePath = path.join(targetDir, templateAsset.destination);
      const renderedContent = await renderTemplateAsset({
        templateRoot,
        asset: templateAsset,
        variables: templateManifest.variables
      });

      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, renderedContent, "utf8");
    })
  );

  return {
    targetDir,
    createdFiles: templateManifest.assets.length
  };
}
