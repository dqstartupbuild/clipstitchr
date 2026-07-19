import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createCliprBrollVisualPrompt } from "@/lib/clipstitchr/server/createCliprBrollVisualPrompt";
import { createCliprReactionVisualPrompt } from "@/lib/clipstitchr/server/createCliprReactionVisualPrompt";
import { getCliprReactionEmotion } from "@/lib/clipstitchr/server/getCliprReactionEmotion";
import { getCliprReactionSourcePrompts } from "@/lib/clipstitchr/server/getCliprReactionSourcePrompts";
import { selectCliprReactionSourcePrompts } from "@/lib/clipstitchr/server/selectCliprReactionSourcePrompts";
import { createId } from "@/lib/clipstitchr/utils/createId";

export function createCliprVisualTextGeneration({
  durationSeconds,
  jobId,
  mode,
  product,
}: {
  durationSeconds: number;
  jobId: string;
  mode: Extract<CliprResolvedGenerationMode, "reaction" | "broll">;
  product: ProductProfile;
}): CliprTextGeneration {
  const emotion = getCliprReactionEmotion(jobId);
  const sourcePrompts =
    mode === "reaction"
      ? selectCliprReactionSourcePrompts({
          count: 4,
          prompts: getCliprReactionSourcePrompts(),
          seed: jobId,
        })
      : [];
  const visualPrompt =
    mode === "reaction"
      ? createCliprReactionVisualPrompt({ emotion, product, sourcePrompts })
      : createCliprBrollVisualPrompt(product);
  const label = mode === "reaction" ? "Reaction shot" : "B-roll shot";
  const script =
    mode === "reaction"
      ? `Silent reaction shot showing ${emotion}.`
      : "Silent product-relevant day-in-the-life b-roll shot.";

  return {
    caption: "",
    description: "",
    filledHook: label,
    hashtags: [],
    hookStyleKey: mode === "reaction" ? "reaction_source" : "broll_source",
    hookTemplateId: mode === "reaction" ? "REACTION-001" : "BROLL-001",
    overlayText: label,
    providerModel: "clipstitchr-local-visual-plan",
    scenePlan: [
      {
        id: createId(),
        index: 0,
        sceneType: "avatar",
        scriptText: script,
        visualPrompt,
        estimatedDurationSeconds: durationSeconds,
      },
    ],
    script,
    slides: [label],
    socialCaption: "",
    variablesUsed:
      mode === "reaction"
        ? {
            emotion,
            sourcePromptIds: sourcePrompts.map((prompt) => prompt.id).join(","),
          }
        : {
            source: "product-context",
          },
  };
}
