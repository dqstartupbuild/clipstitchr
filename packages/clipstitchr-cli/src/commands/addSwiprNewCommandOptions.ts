import type { Command } from "commander";

export function addSwiprNewCommandOptions(command: Command) {
  return command.option("--product <id>", "Use this product ID");
}
