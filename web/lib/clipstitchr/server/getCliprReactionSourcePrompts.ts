import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { CliprReactionSourcePrompt } from "@/lib/clipstitchr/types/CliprReactionSourcePrompt";

type CliprReactionSourcePromptFile = {
  prompts?: CliprReactionSourcePrompt[];
};

let cachedPrompts: CliprReactionSourcePrompt[] | null = null;

export function getCliprReactionSourcePrompts() {
  if (cachedPrompts) {
    return cachedPrompts;
  }

  const filePath = join(
    process.cwd(),
    "lib",
    "clipstitchr",
    "resources",
    "clipr",
    "reaction-source-prompts.json",
  );
  const source = JSON.parse(
    readFileSync(filePath, "utf8"),
  ) as CliprReactionSourcePromptFile;

  cachedPrompts = Array.isArray(source.prompts) ? source.prompts : [];

  return cachedPrompts;
}
