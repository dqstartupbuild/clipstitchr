import type { InteractiveShellChoice } from "./InteractiveShellChoice.js";

export type InteractiveShellPrompts = {
  input: (message: string) => Promise<string>;
  slashCommand: (message: string) => Promise<string>;
  select: <T extends string>(input: {
    choices: InteractiveShellChoice<T>[];
    message: string;
  }) => Promise<T>;
};
