import { input, select } from "@inquirer/prompts";
import type { InteractiveShellPrompts } from "./InteractiveShellPrompts.js";

export function createInteractiveShellPrompts(): InteractiveShellPrompts {
  return {
    input: (message) => input({ message }),
    select: ({ choices, message }) => select({ choices, message }),
  };
}
