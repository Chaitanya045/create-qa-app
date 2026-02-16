const DEFAULT_BASE_URL = "https://example.cypress.io";

function parseBaseUrl(value: string | undefined): string {
  if (!value) {
    return DEFAULT_BASE_URL;
  }

  try {
    new URL(value);
    return value;
  } catch {
    throw new Error("BASE_URL must be a valid URL.");
  }
}

export const env = {
  BASE_URL: parseBaseUrl(process.env.BASE_URL)
} as const;
