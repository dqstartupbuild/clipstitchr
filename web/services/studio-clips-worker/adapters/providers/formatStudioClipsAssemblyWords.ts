import type { AssemblyAiWord } from "./AssemblyAiWord";
import { formatStudioClipsAssemblyTimestamp } from "./formatStudioClipsAssemblyTimestamp";

export function formatStudioClipsAssemblyWords(words: AssemblyAiWord[]): string[] {
  const lines: string[] = [];
  for (let index = 0; index < words.length; index += 10) {
    const group = words.slice(index, index + 10);
    const first = group[0];
    const last = group.at(-1);
    if (
      typeof first?.start !== "number" ||
      typeof last?.end !== "number" ||
      group.some((word) => typeof word.text !== "string")
    ) {
      continue;
    }
    lines.push(
      `[${formatStudioClipsAssemblyTimestamp(first.start)} - ${formatStudioClipsAssemblyTimestamp(last.end)}] ${group
        .map((word) => word.text)
        .join(" ")}`,
    );
  }
  return lines;
}
