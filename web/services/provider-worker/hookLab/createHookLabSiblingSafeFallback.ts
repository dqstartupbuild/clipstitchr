import { createHookLabDeterministicFallback } from "@/lib/clipstitchr/server/hookLab/createHookLabDeterministicFallback";
import { assertHookLabSiblingHookDistinct } from "@/lib/clipstitchr/server/hookLab/assertHookLabSiblingHookDistinct";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";

export function createHookLabSiblingSafeFallback({
  audienceDetails,
  blueprint,
  productName,
  siblingHooks,
  variationDirection,
}: {
  audienceDetails: string;
  blueprint: HookLabTextBlueprint;
  productName: string;
  siblingHooks: string[];
  variationDirection: HookLabVariationDirection;
}) {
  const fallbackTopics = [
    `${productName} through ${variationDirection.fallbackTopic}`,
    `${variationDirection.fallbackTopic} for ${productName}`,
    `${variationDirection.fallbackTopic} for ${audienceDetails}`,
    `${productName}: ${variationDirection.fallbackTopic}`,
  ];

  for (const fallbackTopic of fallbackTopics) {
    try {
      const candidate = createHookLabDeterministicFallback({
        blueprint,
        fallbackTopic,
        slotValues: {
          audience: audienceDetails,
          product: productName,
          topic: fallbackTopic,
        },
      });

      return assertHookLabSiblingHookDistinct({ candidateText: candidate, siblingHooks });
    } catch {
      continue;
    }
  }

  throw new Error("Unable to create a distinct Hook Lab version.");
}
