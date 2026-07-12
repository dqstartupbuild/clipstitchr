import type { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { assertHookLabAdaptedText } from "@/lib/clipstitchr/server/hookLab/assertHookLabAdaptedText";
import { assertHookLabSiblingHookDistinct } from "@/lib/clipstitchr/server/hookLab/assertHookLabSiblingHookDistinct";
import { getHookLabOverlappingSiblingHook } from "@/lib/clipstitchr/server/hookLab/getHookLabOverlappingSiblingHook";
import type { HookLabTextBlueprint } from "@/lib/clipstitchr/types/HookLabTextBlueprint";
import type { HookLabTextDecision } from "@/lib/clipstitchr/types/HookLabTextDecision";
import type { HookLabVariationDirection } from "@/lib/clipstitchr/types/HookLabVariationDirection";
import { createHookLabSiblingSafeFallback } from "./createHookLabSiblingSafeFallback";
import { rewriteHookLabAdaptedText } from "./rewriteHookLabAdaptedText";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createHookLabSafeAdaptation({
  allowRewrite = true,
  audienceDetails,
  candidateText,
  decision,
  productName,
  replicate,
  siblingHooks,
  sourceText,
  textBlueprint,
  variationDirection,
}: {
  allowRewrite?: boolean;
  audienceDetails: string;
  candidateText: string;
  decision: HookLabTextDecision;
  productName: string;
  replicate: ReplicateClient;
  siblingHooks: string[];
  sourceText: string;
  textBlueprint: HookLabTextBlueprint;
  variationDirection: HookLabVariationDirection;
}) {
  const overlappingSibling = getHookLabOverlappingSiblingHook({
    candidateText,
    siblingHooks,
  });

  try {
    const sourceSafeCandidate =
      decision === "adapted"
        ? assertHookLabAdaptedText({ candidateText, sourceText })
        : candidateText.trim();

    return {
      forcedBySibling: false,
      generatedHook: assertHookLabSiblingHookDistinct({
        candidateText: sourceSafeCandidate,
        siblingHooks,
      }),
      predictionIds: [] as string[],
      rewriteCount: 0,
      textDecision: decision,
    };
  } catch {
    if (allowRewrite) {
      const rewrite = await rewriteHookLabAdaptedText({
        candidateText,
        productName,
        replicate,
        siblingHooks,
        sourceText,
        textBlueprint,
        variationDirection,
      });

      try {
        const sourceSafeRewrite = assertHookLabAdaptedText({
          candidateText: rewrite.adaptedHook,
          sourceText,
        });

        return {
          forcedBySibling: Boolean(overlappingSibling),
          generatedHook: assertHookLabSiblingHookDistinct({
            candidateText: sourceSafeRewrite,
            siblingHooks,
          }),
          predictionIds: [rewrite.predictionId],
          rewriteCount: 1,
          textDecision: "adapted" as const,
        };
      } catch {
        return {
          forcedBySibling: Boolean(overlappingSibling),
          generatedHook: createHookLabSiblingSafeFallback({
            audienceDetails,
            blueprint: textBlueprint,
            productName,
            siblingHooks,
            variationDirection,
          }),
          predictionIds: [rewrite.predictionId],
          rewriteCount: 1,
          textDecision: "adapted" as const,
        };
      }
    }

    return {
      forcedBySibling: Boolean(overlappingSibling),
      generatedHook: createHookLabSiblingSafeFallback({
        audienceDetails,
        blueprint: textBlueprint,
        productName,
        siblingHooks,
        variationDirection,
      }),
      predictionIds: [] as string[],
      rewriteCount: 0,
      textDecision: "adapted" as const,
    };
  }
}
