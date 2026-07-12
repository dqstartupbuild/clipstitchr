import { hookLabMaximumAdaptedTextSimilarity } from "@/lib/clipstitchr/constants/hookLabMaximumAdaptedTextSimilarity";
import { getHookLabTextSimilarity } from "@/lib/clipstitchr/server/hookLab/getHookLabTextSimilarity";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";

type CreateHookLabDeterministicFallbackOptions = {
  blueprint: HookLabTextBlueprint;
  fallbackTopic?: string;
  slotValues?: Record<string, string | undefined>;
};

export function createHookLabDeterministicFallback({
  blueprint,
  fallbackTopic,
  slotValues = {},
}: CreateHookLabDeterministicFallbackOptions) {
  const topic =
    fallbackTopic?.trim() || blueprint.sourceNiche?.trim() || "your next post";
  let filledPattern = blueprint.reusablePattern.trim();

  for (const slot of blueprint.semanticSlots) {
    const value =
      slotValues[slot.name]?.trim() || slot.fallbackValue?.trim() || topic;
    const escapedName = slot.name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    filledPattern = filledPattern.replace(
      new RegExp(
        `\\{\\{\\s*${escapedName}\\s*\\}\\}|\\{\\s*${escapedName}\\s*\\}|\\[\\s*${escapedName}\\s*\\]`,
        "gi",
      ),
      () => value,
    );
  }

  const candidates = [
    filledPattern.replace(/\s+/g, " ").trim(),
    `The part of ${topic} most people miss`,
    `A better way to think about ${topic}`,
    `Watch what changes when you try ${topic}`,
  ].filter(
    (candidate) =>
      Boolean(candidate) &&
      !/\{\{[^}]+\}\}|\{[^}]+\}|\[[^\]]+\]/.test(candidate),
  );
  const safeCandidate = candidates.find(
    (candidate) =>
      getHookLabTextSimilarity(blueprint.sourceText, candidate) <
      hookLabMaximumAdaptedTextSimilarity,
  );

  if (!safeCandidate) {
    throw new Error("Unable to create a safe fallback hook.");
  }

  return safeCandidate;
}
