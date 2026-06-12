import type { CliprReactionSourcePrompt } from "@/lib/clipstitchr/types/CliprReactionSourcePrompt";
import { getSeededIndex } from "@/lib/clipstitchr/utils/getSeededIndex";

export function selectCliprReactionSourcePrompts({
  count,
  prompts,
  seed,
}: {
  count: number;
  prompts: CliprReactionSourcePrompt[];
  seed: string;
}) {
  if (prompts.length <= count) {
    return prompts;
  }

  const selected: CliprReactionSourcePrompt[] = [];
  let offset = 0;

  while (selected.length < count && offset < prompts.length) {
    const prompt = prompts[getSeededIndex(`${seed}:${offset}`, prompts.length)];

    if (!selected.some((item) => item.id === prompt.id)) {
      selected.push(prompt);
    }

    offset += 1;
  }

  return selected;
}
