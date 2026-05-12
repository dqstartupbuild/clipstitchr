import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";

const CANDIDATE_COUNT = 5;

export function selectCliprHookCandidates(
  templates: CliprHookTemplate[],
): CliprHookTemplate[] {
  const shuffledTemplates = [...templates].sort(() => Math.random() - 0.5);

  return shuffledTemplates.slice(0, CANDIDATE_COUNT);
}
