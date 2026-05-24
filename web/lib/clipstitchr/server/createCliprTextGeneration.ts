import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createCliprTextGenerationPrompt } from "@/lib/clipstitchr/server/createCliprTextGenerationPrompt";
import { getCliprEligibleHookTemplates } from "@/lib/clipstitchr/server/getCliprEligibleHookTemplates";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCliprProductPlaceholderFillers } from "@/lib/clipstitchr/server/getCliprProductPlaceholderFillers";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { parseCliprTextGenerationOutput } from "@/lib/clipstitchr/server/parseCliprTextGenerationOutput";
import { selectCliprHookCandidates } from "@/lib/clipstitchr/server/selectCliprHookCandidates";
import type { CliprCompositionStrategy } from "@/lib/clipstitchr/types/CliprCompositionStrategy";
import { defaultCliprContentType } from "@/lib/clipstitchr/constants/defaultCliprContentType";
import type { CliprContentType } from "@/lib/clipstitchr/types/CliprContentType";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createCliprTextGeneration({
  compositionStrategy = "single-video",
  contentType = defaultCliprContentType,
  durationSeconds,
  product,
  purpose,
  replicate,
  sceneCount = 1,
  slideCount,
}: {
  compositionStrategy?: CliprCompositionStrategy;
  contentType?: CliprContentType;
  durationSeconds: CliprDurationSeconds;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  replicate: ReplicateClient;
  sceneCount?: number;
  slideCount: number;
}) {
  const providerModel = getCliprHookModelId();
  const candidates = selectCliprHookCandidates(
    getCliprEligibleHookTemplates(product, purpose),
    purpose,
  );
  const prediction = await replicate.predictions.create({
    model: providerModel,
    input: {
      prompt: createCliprTextGenerationPrompt({
        candidates,
        compositionStrategy,
        contentType,
        durationSeconds,
        fillers: getCliprProductPlaceholderFillers(product),
        product,
        purpose,
        sceneCount,
        slideCount,
      }),
      system_prompt: getCliprTextSystemPrompt(purpose),
      temperature: 0.65,
      max_completion_tokens: 1200,
    },
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete Clipr text generation.",
    prediction,
    replicate,
  });

  return parseCliprTextGenerationOutput({
    candidates,
    durationSeconds,
    outputText,
    providerModel,
    product,
    purpose,
    compositionStrategy,
    contentType,
    sceneCount,
    slideCount,
  });
}
