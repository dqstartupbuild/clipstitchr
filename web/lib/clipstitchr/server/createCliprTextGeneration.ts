import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createStitchrFallbackGenerationOutputText } from "@/lib/clipstitchr/server/createStitchrFallbackGenerationOutputText";
import { StitchrHookContractError } from "@/lib/clipstitchr/server/StitchrHookContractError";
import { createCliprTextGenerationPrompt } from "@/lib/clipstitchr/server/createCliprTextGenerationPrompt";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCliprEligibleHookTemplates } from "@/lib/clipstitchr/server/getCliprEligibleHookTemplates";
import { getCliprHookModelId } from "@/lib/clipstitchr/server/getCliprHookModelId";
import { getCliprProductPlaceholderFillers } from "@/lib/clipstitchr/server/getCliprProductPlaceholderFillers";
import { getCliprTextSystemPrompt } from "@/lib/clipstitchr/server/getCliprTextSystemPrompt";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getStitchrHookMatchesAssignedOpener } from "@/lib/clipstitchr/server/getStitchrHookMatchesAssignedOpener";
import { parseCliprTextGenerationOutput } from "@/lib/clipstitchr/server/parseCliprTextGenerationOutput";
import { selectCliprHookCandidates } from "@/lib/clipstitchr/server/selectCliprHookCandidates";
import { selectStitchrHookCandidates } from "@/lib/clipstitchr/server/selectStitchrHookCandidates";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprTextPurpose } from "@/lib/clipstitchr/types/CliprTextPurpose";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";
import type { SwiprSelectedSlideTextContext } from "@/lib/clipstitchr/types/SwiprSelectedSlideTextContext";
import type { SwiprCallToActionStyle } from "@/lib/clipstitchr/types/SwiprCallToActionStyle";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createCliprTextGeneration({
  durationSeconds,
  product,
  purpose,
  replicate,
  scriptIdea,
  slideCount,
  stitchrClipContexts = [],
  stitchrHookVariationSeed,
  swiprCallToActionStyle,
  swiprCreativeContext,
  swiprSelectedSlideTextContext,
}: {
  durationSeconds: CliprDurationSeconds;
  product: ProductProfile;
  purpose: CliprTextPurpose;
  replicate: ReplicateClient;
  scriptIdea?: string;
  slideCount: number;
  stitchrClipContexts?: StitchrTextGenerationClipContext[];
  stitchrHookVariationSeed?: string;
  swiprCallToActionStyle?: SwiprCallToActionStyle;
  swiprCreativeContext?: string;
  swiprSelectedSlideTextContext?: SwiprSelectedSlideTextContext;
}) {
  const providerModel = getCliprHookModelId();
  const fillers = getCliprProductPlaceholderFillers(product);
  const eligibleTemplates = getCliprEligibleHookTemplates(product, purpose);
  const candidates =
    purpose === "stitchr"
      ? selectStitchrHookCandidates({
          clipContexts: stitchrClipContexts,
          product,
          templates: eligibleTemplates,
          variationSeed: stitchrHookVariationSeed,
        })
      : selectCliprHookCandidates(eligibleTemplates);
  const generationPrompt = createCliprTextGenerationPrompt({
    candidates,
    durationSeconds,
    fillers,
    product,
    purpose,
    scriptIdea,
    slideCount,
    stitchrClipContexts,
    swiprCallToActionStyle,
    swiprCreativeContext,
    swiprSelectedSlideTextContext,
  });
  const systemPrompt = getCliprTextSystemPrompt(purpose);
  const maximumAttempts = purpose === "stitchr" ? 2 : 1;
  let lastPredictionId = "";
  let lastGenerationError: unknown;

  for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
    const retryInstruction =
      attempt === 0
        ? ""
        : "\n\nYour previous response was unusable because it exposed analysis, returned incomplete JSON, or ignored the assigned winner. Return only the compact JSON object now. Use the assigned candidate ID and exact opener words for hookOptions[0]. Start with {, end with }, and include no text outside it.";
    let outputText = "";
    let prediction: Awaited<
      ReturnType<ReplicateClient["predictions"]["create"]>
    >;

    try {
      prediction = await replicate.predictions.create({
        model: providerModel,
        input: createTextWritingPredictionInput({
          maxCompletionTokens:
            purpose === "stitchr" ? 3200 : purpose === "clipr" ? 1800 : 1200,
          modelId: providerModel,
          prompt: `${generationPrompt}${retryInstruction}`,
          systemPrompt,
        }),
      });
      outputText = await getCompletedReplicatePredictionOutputText({
        failureMessage: "Replicate did not complete Clipr text generation.",
        prediction,
        replicate,
      });
    } catch (error) {
      if (purpose !== "stitchr") {
        throw error;
      }

      lastGenerationError = error;

      if (attempt < maximumAttempts - 1) {
        continue;
      }

      break;
    }

    lastPredictionId = prediction.id;

    try {
      const generation = parseCliprTextGenerationOutput({
        candidates,
        durationSeconds,
        outputText,
        providerModel,
        product,
        purpose,
        slideCount,
        stitchrHookVariationSeed,
      });
      const assignedCandidate = candidates[0];

      if (
        purpose === "stitchr" &&
        (generation.hookTemplateId !== assignedCandidate?.id ||
          !getStitchrHookMatchesAssignedOpener({
            hook: generation.filledHook,
            template: assignedCandidate,
          }))
      ) {
        throw new StitchrHookContractError(
          "Stitchr text generation ignored its assigned Hook Library opener.",
        );
      }

      return {
        ...generation,
        providerPredictionId: prediction.id,
      };
    } catch (error) {
      lastGenerationError = error;
      const canRetry =
        error instanceof SyntaxError ||
        error instanceof StitchrHookContractError;

      if (!canRetry) {
        throw error;
      }

      if (attempt === maximumAttempts - 1) {
        break;
      }
    }
  }

  if (purpose === "stitchr") {
    const fallbackGeneration = parseCliprTextGenerationOutput({
      candidates,
      durationSeconds,
      outputText: createStitchrFallbackGenerationOutputText({
        candidates,
        product,
        variationSeed: stitchrHookVariationSeed,
      }),
      providerModel,
      product,
      purpose,
      slideCount,
      stitchrHookVariationSeed,
    });

    return {
      ...fallbackGeneration,
      ...(lastPredictionId ? { providerPredictionId: lastPredictionId } : {}),
    };
  }

  throw lastGenerationError;
}
