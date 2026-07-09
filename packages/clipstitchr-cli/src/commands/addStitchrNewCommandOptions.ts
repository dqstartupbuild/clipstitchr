import type { Command } from "commander";

export function addStitchrNewCommandOptions(command: Command) {
  return command
    .option("--product <id>", "Use this product ID")
    .option("--sound <id>", "Use a saved sound ID")
    .option("--template <id>", "Use a saved Stitch template ID")
    .option("--time-zone <name>", "Use this time zone for today's Stitchr work");
}
