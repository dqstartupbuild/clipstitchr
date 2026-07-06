import type { Command } from "commander";

export function findCliHelpCommand(
  program: Command,
  commandPath: string[],
): Command | null {
  return commandPath.reduce<Command | null>((currentCommand, commandName) => {
    if (!currentCommand) {
      return null;
    }

    return (
      currentCommand.commands.find(
        (candidate) =>
          candidate.name() === commandName ||
          candidate.aliases().includes(commandName),
      ) ?? null
    );
  }, program);
}
