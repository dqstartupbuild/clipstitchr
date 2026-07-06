#!/usr/bin/env node
import { runCli } from "./commands/runCli.js";
import { formatErrorText } from "./terminal/formatErrorText.js";

runCli(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);

  console.error(formatErrorText(`Error: ${message}`));
  process.exitCode = 1;
});
