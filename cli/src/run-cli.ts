import { runCreateCommand } from "./commands/create";

type RunCliOptions = {
  argv?: string[];
  runCreate?: () => Promise<void>;
  writeError?: (message: string) => void;
  exit?: (code: number) => never;
};

export async function runCli(options: RunCliOptions = {}): Promise<void> {
  const argv = options.argv ?? process.argv;
  const command = argv[2];

  if (!command || command === "create" || command.startsWith("-")) {
    await (options.runCreate ?? runCreateCommand)();
    return;
  }

  const writeError = options.writeError ?? console.error;
  writeError(`Unknown command: ${command}`);
  writeError("Available commands: create");

  const exit = options.exit ?? ((code: number) => process.exit(code));
  exit(1);
}
