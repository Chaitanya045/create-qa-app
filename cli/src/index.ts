import { runCreateCommand } from "./commands/create";

async function main(): Promise<void> {
  const command = process.argv[2];

  if (!command || command === "create" || command.startsWith("-")) {
    await runCreateCommand();
    return;
  }

  console.error(`Unknown command: ${command}`);
  console.error("Available commands: create");
  process.exit(1);
}

void main();
