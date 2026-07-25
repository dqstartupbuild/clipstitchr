import type { CliprHookTemplate } from "@/lib/clipstitchr/types/CliprHookTemplate";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";

const stitchrExclusiveSources = new Set([
  "polarizing_reaction_patterns",
  "ugc_discovery_patterns",
]);

export function getStitchrExclusiveHookTemplates({
  purpose,
  templates,
}: {
  purpose: CliprTextPurpose;
  templates: CliprHookTemplate[];
}) {
  if (purpose !== "stitchr") {
    return [];
  }

  return templates.filter(
    (template) =>
      template.active &&
      template.allowedPurposes.includes("stitchr") &&
      stitchrExclusiveSources.has(template.source),
  );
}
