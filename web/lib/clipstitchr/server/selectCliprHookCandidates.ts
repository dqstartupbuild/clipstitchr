import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

const CANDIDATE_COUNT = 5;
const POLARIZING_REACTION_SOURCE = "polarizing_reaction_patterns";
const STITCHR_POLARIZING_CANDIDATE_COUNT = 4;

function shuffleHookTemplates(templates: CliprHookTemplate[]) {
  return [...templates].sort(() => Math.random() - 0.5);
}

function selectStitchrHookCandidates(templates: CliprHookTemplate[]) {
  const polarizingTemplates = shuffleHookTemplates(
    templates.filter((template) => template.source === POLARIZING_REACTION_SOURCE),
  );
  const otherTemplates = shuffleHookTemplates(
    templates.filter((template) => template.source !== POLARIZING_REACTION_SOURCE),
  );
  const polarizingCount = Math.min(
    STITCHR_POLARIZING_CANDIDATE_COUNT,
    polarizingTemplates.length,
  );

  if (!polarizingCount) {
    return otherTemplates.slice(0, CANDIDATE_COUNT);
  }

  return [
    ...polarizingTemplates.slice(0, polarizingCount),
    ...otherTemplates.slice(0, CANDIDATE_COUNT - polarizingCount),
    ...polarizingTemplates.slice(polarizingCount),
  ].slice(0, CANDIDATE_COUNT);
}

export function selectCliprHookCandidates(
  templates: CliprHookTemplate[],
  purpose?: CliprTextPurpose,
): CliprHookTemplate[] {
  if (purpose === "stitchr") {
    return selectStitchrHookCandidates(templates);
  }

  return shuffleHookTemplates(templates).slice(0, CANDIDATE_COUNT);
}
