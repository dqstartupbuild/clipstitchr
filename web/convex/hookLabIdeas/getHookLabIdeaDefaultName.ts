import type { HookLabIdeaSourceType } from "../../lib/clipstitchr/types/HookLabIdeaSourceType";

export function getHookLabIdeaDefaultName({
  sourceLabel,
  sourceType,
}: {
  sourceLabel?: string;
  sourceType: HookLabIdeaSourceType;
}) {
  const label = sourceLabel?.trim().replace(/\s+/g, " ").slice(0, 64);

  if (label) {
    return label.length < 64 ? label : `${label.slice(0, 61)}...`;
  }

  if (sourceType === "social_link") {
    return "Social post idea";
  }

  if (sourceType === "stitch") {
    return "Stitch idea";
  }

  if (sourceType === "generated_hook") {
    return "Saved hook idea";
  }

  return "New hook idea";
}
