import type { InteractiveShellPrompts } from "../../src/interactiveShell/InteractiveShellPrompts.js";

export function createInteractiveShellTestPrompts(input: {
  inputs?: string[];
  selections?: string[];
}) {
  const inputs = [...(input.inputs ?? [])];
  const selections = [...(input.selections ?? [])];

  return {
    input: async () => inputs.shift() ?? "",
    slashCommand: async () => inputs.shift() ?? "",
    select: async () => selections.shift() ?? "nav:exit",
  } satisfies InteractiveShellPrompts;
}
