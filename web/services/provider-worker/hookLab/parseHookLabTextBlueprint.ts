import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import { getHookLabOptionalParsedString } from "./getHookLabOptionalParsedString";
import { getHookLabParsedObject } from "./getHookLabParsedObject";
import { getHookLabParsedString } from "./getHookLabParsedString";
import { getHookLabParsedStringArray } from "./getHookLabParsedStringArray";

export function parseHookLabTextBlueprint(
  value: unknown,
  fallbackSourceText: string,
): HookLabTextBlueprint {
  const blueprint = getHookLabParsedObject(value);
  const sourceText =
    getHookLabParsedString(blueprint.sourceText, "", 1_000) || fallbackSourceText;
  const reusablePattern =
    getHookLabParsedString(blueprint.reusablePattern, "", 1_000) ||
    sourceText ||
    "A surprising change in {{topic}}";
  const rawSlots = Array.isArray(blueprint.semanticSlots)
    ? blueprint.semanticSlots
    : [];

  return {
    cadence: getHookLabParsedString(
      blueprint.cadence,
      "Short, clear overlay cadence",
      300,
    ),
    claimsRequiringSupport: getHookLabParsedStringArray(
      blueprint.claimsRequiringSupport,
    ),
    emotionalJob: getHookLabParsedString(
      blueprint.emotionalJob,
      "Create curiosity",
      300,
    ),
    exactReuseConstraints: getHookLabParsedStringArray(
      blueprint.exactReuseConstraints,
    ),
    productSpecificTokens: getHookLabParsedStringArray(
      blueprint.productSpecificTokens,
    ),
    reusablePattern,
    semanticSlots: rawSlots.slice(0, 12).flatMap((entry, index) => {
      const slot = getHookLabParsedObject(entry);
      const name = getHookLabParsedString(slot.name, `topic_${index + 1}`, 80)
        .toLowerCase()
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "");
      const meaning = getHookLabParsedString(
        slot.meaning,
        "Product-relevant topic",
        240,
      );
      const fallbackValue = getHookLabOptionalParsedString(
        slot.fallbackValue,
        160,
      );

      return name
        ? [{ name, meaning, ...(fallbackValue ? { fallbackValue } : {}) }]
        : [];
    }),
    ...(getHookLabOptionalParsedString(blueprint.sourceNiche, 240)
      ? {
          sourceNiche: getHookLabOptionalParsedString(
            blueprint.sourceNiche,
            240,
          ),
        }
      : {}),
    sourceText,
    unresolvedVisualReferences: getHookLabParsedStringArray(
      blueprint.unresolvedVisualReferences,
    ),
  };
}
