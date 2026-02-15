import { readFile } from "node:fs/promises";
import path from "node:path";
import type { TemplateAsset } from "./manifest";

type RenderOptions = {
  templateRoot: string;
  asset: TemplateAsset;
  variables: Record<string, string>;
};

const TEMPLATE_TOKEN_PATTERN = /\{\{([a-zA-Z0-9_]+)\}\}/g;

function substituteTemplateVariables(
  templateContent: string,
  variables: Record<string, string>,
  sourceFile: string
): string {
  return templateContent.replace(TEMPLATE_TOKEN_PATTERN, (_fullMatch, variableName: string) => {
    const value = variables[variableName];

    if (value === undefined) {
      throw new Error(`Missing template variable "${variableName}" while rendering "${sourceFile}".`);
    }

    return value;
  });
}

export async function renderTemplateAsset(options: RenderOptions): Promise<string> {
  const sourcePath = path.join(options.templateRoot, options.asset.source);
  const sourceContent = await readFile(sourcePath, "utf8");

  if (options.asset.source.endsWith(".tpl")) {
    return substituteTemplateVariables(sourceContent, options.variables, options.asset.source);
  }

  return sourceContent;
}
