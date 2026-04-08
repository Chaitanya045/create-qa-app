import { afterEach, describe, expect, mock, spyOn, test } from "bun:test";
import { resolveLatestVersions } from "../cli/src/core/version-resolver";

afterEach(() => {
  mock.restore();
});

describe("version resolver", () => {
  test("resolves latest versions and deduplicates package lookups", async () => {
    const fetchSpy = spyOn(globalThis, "fetch").mockImplementation((async (input, init) => {
      expect(init).toEqual({
        headers: {
          Accept: "application/json"
        }
      });

      const url = String(input);

      if (url.endsWith("/%40playwright%2Ftest/latest")) {
        return new Response(JSON.stringify({ version: "1.58.2" }), { status: 200 });
      }

      if (url.endsWith("/typescript/latest")) {
        return new Response(JSON.stringify({ version: "5.9.3" }), { status: 200 });
      }

      throw new Error(`Unexpected URL ${url}`);
    }) as typeof fetch);

    const result = await resolveLatestVersions([
      "@playwright/test",
      "typescript",
      "@playwright/test"
    ]);

    expect(result).toEqual({
      versions: {
        "@playwright/test": "1.58.2",
        typescript: "5.9.3"
      },
      failedPackages: []
    });
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  test("falls back to latest when registry lookup fails", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

    const result = await resolveLatestVersions(["zod"]);

    expect(result.versions).toEqual({ zod: "latest" });
    expect(result.failedPackages).toEqual(["zod"]);
  });

  test("falls back to latest when version is missing", async () => {
    spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ dist: "latest" }), { status: 200 })
    );

    const result = await resolveLatestVersions(["eslint"]);

    expect(result.versions).toEqual({ eslint: "latest" });
    expect(result.failedPackages).toEqual(["eslint"]);
  });
});
