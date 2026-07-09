import type { Command } from "commander";

export function addDemoManualCommandOptions(command: Command) {
  return command
    .option("--guide <name-id-or-path>", "Use a saved walkthrough guide")
    .option("--no-guide", "Record without a walkthrough guide")
    .option("--no-upload", "Record only")
    .option("--output <path>", "Save the MP4 here")
    .option("--product <id>", "Use this product ID")
    .option("--start <command>", "Start command")
    .option("--url <url>", "Local app URL");
}
