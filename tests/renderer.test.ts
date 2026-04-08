import { afterEach, describe, expect, test } from "bun:test";
import { renderTemplateAsset } from "../cli/src/template/renderer";
import { createTempDir, removeTempDir, writeTextFile } from "./helpers/fs";

const tempDirs: string[] = [];

afterEach(async () => {
  while (tempDirs.length > 0) {
    const tempDir = tempDirs.pop();

    if (tempDir) {
      await removeTempDir(tempDir);
    }
  }
});

describe("template renderer", () => {
  test("substitutes template variables in tpl files", async () => {
    const templateRoot = await createTempDir("renderer-template-");
    tempDirs.push(templateRoot);
    await writeTextFile(templateRoot, "docs/README.md.tpl", "Hello {{name}} from {{tool}}!");

    const rendered = await renderTemplateAsset({
      templateRoot,
      asset: {
        source: "docs/README.md.tpl",
        destination: "README.md"
      },
      variables: {
        name: "Chaitanya",
        tool: "create-qa-app"
      }
    });

    expect(rendered).toBe("Hello Chaitanya from create-qa-app!");
  });

  test("throws when a template variable is missing", async () => {
    const templateRoot = await createTempDir("renderer-missing-");
    tempDirs.push(templateRoot);
    await writeTextFile(templateRoot, "package.json.tpl", '{"name":"{{packageName}}"}');

    await expect(
      renderTemplateAsset({
        templateRoot,
        asset: {
          source: "package.json.tpl",
          destination: "package.json"
        },
        variables: {}
      })
    ).rejects.toThrow(
      'Missing template variable "packageName" while rendering "package.json.tpl".'
    );
  });

  test("returns raw content for non-template files", async () => {
    const templateRoot = await createTempDir("renderer-plain-");
    tempDirs.push(templateRoot);
    await writeTextFile(templateRoot, "base/.gitignore", "node_modules\n");

    const rendered = await renderTemplateAsset({
      templateRoot,
      asset: {
        source: "base/.gitignore",
        destination: ".gitignore"
      },
      variables: {
        unused: "value"
      }
    });

    expect(rendered).toBe("node_modules\n");
  });
});
