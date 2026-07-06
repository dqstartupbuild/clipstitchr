#!/usr/bin/env node
import { runCli } from "./commands/runCli.js";

runCli(process.argv).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
