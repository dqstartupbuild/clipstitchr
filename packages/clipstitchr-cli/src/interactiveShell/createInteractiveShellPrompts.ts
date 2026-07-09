import { input, search, select } from "@inquirer/prompts";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";
import { createSlashCommandSearchChoices } from "./createSlashCommandSearchChoices.js";

export function createInteractiveShellPrompts(): InteractiveShellPrompts {
  return {
    input: (message) => input({ message }),
    slashCommand: (message) =>
      search({
        instructions: {
          navigation:
            "Type to filter, Tab to complete, Enter to run the selected command.",
          pager: "Use arrows to move through more slash commands.",
        },
        message,
        pageSize: 10,
        source: (term) => createSlashCommandSearchChoices(term),
      }),
    select: ({ choices, message }) => select({ choices, message }),
  };
}
