import type { Command } from "commander";
import { findCliHelpCommand } from "./findCliHelpCommand.js";

export function runHelpCommand(program: Command, commandPath: string[] = []) {
  const command = findCliHelpCommand(program, commandPath);

  if (!command) {
    throw new Error("Unknown command. Run clipstitchr --help to see options.");
  }

  console.log(command.helpInformation());
}
