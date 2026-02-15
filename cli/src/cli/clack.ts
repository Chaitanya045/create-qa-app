export type ClackModule = typeof import("@clack/prompts");

const CLACK_MODULE_NAME = "@clack/prompts";

export async function loadClack(): Promise<ClackModule> {
  return await import(CLACK_MODULE_NAME);
}
