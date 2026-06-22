import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createCliprTextGenerationPrompt } from "@/lib/clipstitchr/server/createCliprTextGenerationPrompt";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCliprEligibleHookTemplates } from "@/lib/clipstitchr/server/getCliprEligibleHookTemplates";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCliprProductPlaceholderFillers } from "@/lib/clipstitchr/server/getCliprProductPlaceholderFillers";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { parseCliprTextGenerationOutput } from "@/lib/clipstitchr/server/parseCliprTextGenerationOutput";
import { selectCliprHookCandidates } from "@/lib/clipstitchr/server/selectCliprHookCandidates";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import type { SwiprSelectedSlideTextContext } from "@/lib/clipstitchr/types/SwiprSelectedSlideTextContext";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createCliprTextGeneration({
  durationSeconds,
  product,
  purpose,
  replicate,
  scriptIdea,
  slideCount,
  stitchrClipContexts = [],
  swiprSelectedSlideTextContext,
}: {
  durationSeconds: CliprDurationSeconds;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  replicate: ReplicateClient;
  scriptIdea?: string;
  slideCount: number;
  stitchrClipContexts?: StitchrTextGenerationClipContext[];
  swiprSelectedSlideTextContext?: SwiprSelectedSlideTextContext;
}) {
  const providerModel = getCliprHookModelId();
  const candidates = selectCliprHookCandidates(
    getCliprEligibleHookTemplates(product, purpose),
    purpose,
  );
  const prediction = await replicate.predictions.create({
    model: providerModel,
    input: createTextWritingPredictionInput({
      maxCompletionTokens:
        purpose === "clipr" || purpose === "stitchr" ? 1800 : 1200,
      modelId: providerModel,
      prompt: createCliprTextGenerationPrompt({
        candidates,
        durationSeconds,
        fillers: getCliprProductPlaceholderFillers(product),
        product,
        purpose,
        scriptIdea,
        slideCount,
        stitchrClipContexts,
        swiprSelectedSlideTextContext,
      }),
      systemPrompt: getCliprTextSystemPrompt(purpose),
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete Clipr text generation.",
    prediction,
    replicate,
  });

  return {
    ...parseCliprTextGenerationOutput({
      candidates,
      durationSeconds,
      outputText,
      providerModel,
      product,
      purpose,
      slideCount,
    }),
    providerPredictionId: prediction.id,
  };
}
