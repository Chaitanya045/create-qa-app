export type ResolvedVersions = Record<string, string>;

const NPM_REGISTRY_BASE_URL = "https://registry.npmjs.org";

function getRegistryLatestUrl(packageName: string): string {
  return `${NPM_REGISTRY_BASE_URL}/${encodeURIComponent(packageName)}/latest`;
}

type RegistryLatestResponse = {
  version?: unknown;
};

async function resolveLatestVersion(packageName: string): Promise<string> {
  const response = await fetch(getRegistryLatestUrl(packageName), {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Registry lookup failed for ${packageName} with HTTP ${String(response.status)}.`);
  }

  const payload = (await response.json()) as RegistryLatestResponse;

  if (typeof payload.version !== "string" || payload.version.length === 0) {
    throw new Error(`Registry response missing version for ${packageName}.`);
  }

  return payload.version;
}

export async function resolveLatestVersions(packageNames: string[]): Promise<{
  versions: ResolvedVersions;
  failedPackages: string[];
}> {
  const uniquePackageNames = [...new Set(packageNames)];
  const versions: ResolvedVersions = {};
  const failedPackages: string[] = [];

  await Promise.all(
    uniquePackageNames.map(async (packageName) => {
      try {
        versions[packageName] = await resolveLatestVersion(packageName);
      } catch {
        versions[packageName] = "latest";
        failedPackages.push(packageName);
      }
    })
  );

  return {
    versions,
    failedPackages
  };
}
