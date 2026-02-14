import { mkdir, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { CliConfig } from "./schema";
import { createTemplateFiles } from "./templates";

export type ScaffoldResult = {
  targetDir: string;
  createdFiles: number;
};

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

  const templateFiles = createTemplateFiles(config);

  await Promise.all(
    templateFiles.map(async (templateFile) => {
      const absolutePath = path.join(targetDir, templateFile.path);
      await mkdir(path.dirname(absolutePath), { recursive: true });
      await writeFile(absolutePath, templateFile.content, "utf8");
    })
  );

  return {
    targetDir,
    createdFiles: templateFiles.length
  };
}
