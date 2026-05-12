import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createCliprTextGenerationPrompt } from "@/lib/clipstitchr/server/createCliprTextGenerationPrompt";
import { getCliprEligibleHookTemplates } from "@/lib/clipstitchr/server/getCliprEligibleHookTemplates";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCliprProductPlaceholderFillers } from "@/lib/clipstitchr/server/getCliprProductPlaceholderFillers";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { parseCliprTextGenerationOutput } from "@/lib/clipstitchr/server/parseCliprTextGenerationOutput";
import { selectCliprHookCandidates } from "@/lib/clipstitchr/server/selectCliprHookCandidates";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

const CLIPR_TEXT_SYSTEM_PROMPT =
  "You write concise non-promotional short-form engagement copy. Return valid JSON only.";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createCliprTextGeneration({
  durationSeconds,
  product,
  purpose,
  replicate,
  slideCount,
}: {
  durationSeconds: CliprDurationSeconds;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  replicate: ReplicateClient;
  slideCount: number;
}) {
  const providerModel = getCliprHookModelId();
  const candidates = selectCliprHookCandidates(
    getCliprEligibleHookTemplates(product),
  );
  const prediction = await replicate.predictions.create({
    model: providerModel,
    input: {
      prompt: createCliprTextGenerationPrompt({
        candidates,
        durationSeconds,
        fillers: getCliprProductPlaceholderFillers(product),
        product,
        purpose,
        slideCount,
      }),
      system_prompt: CLIPR_TEXT_SYSTEM_PROMPT,
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
    slideCount,
  });
}
