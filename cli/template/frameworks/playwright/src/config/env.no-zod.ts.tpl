const DEFAULT_BASE_URL = "https://the-internet.herokuapp.com";
const DEFAULT_USERNAME = "tomsmith";
const DEFAULT_PASSWORD = "SuperSecretPassword!";

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
  BASE_URL: parseBaseUrl(process.env.BASE_URL),
  USERNAME: (process.env.USERNAME ?? "").trim() || DEFAULT_USERNAME,
  PASSWORD: (process.env.PASSWORD ?? "").trim() || DEFAULT_PASSWORD
} as const;

export type Env = typeof env;
