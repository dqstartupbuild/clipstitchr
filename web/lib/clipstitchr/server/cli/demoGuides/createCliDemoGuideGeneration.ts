import type { Prediction } from "replicate";
import type { CliDemoGuideGenerateRequest } from "@/lib/clipstitchr/server/cli/demoGuides/CliDemoGuideGenerateRequest";
import { createCliDemoGuidePrompt } from "@/lib/clipstitchr/server/cli/demoGuides/createCliDemoGuidePrompt";
import { createCliDemoGuideRepairPrompt } from "@/lib/clipstitchr/server/cli/demoGuides/createCliDemoGuideRepairPrompt";
import { createCliDemoWalkthroughGuide } from "@/lib/clipstitchr/server/cli/demoGuides/createCliDemoWalkthroughGuide";
import { getCliDemoGuideSystemPrompt } from "@/lib/clipstitchr/server/cli/demoGuides/getCliDemoGuideSystemPrompt";
import { parseCliDemoGuideGenerationOutput } from "@/lib/clipstitchr/server/cli/demoGuides/parseCliDemoGuideGenerationOutput";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getTextWritingModelId } from "@/lib/clipstitchr/server/getTextWritingModelId";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createCliDemoGuideGeneration({
  createdAt,
  product,
  replicate,
  request,
}: {
  createdAt: string;
  product: ProductProfile;
  replicate: ReplicateClient;
  request: CliDemoGuideGenerateRequest;
}) {
  const providerModel = getTextWritingModelId();
  const systemPrompt = getCliDemoGuideSystemPrompt();
  const prediction = await replicate.predictions.create({
    model: providerModel,
    input: createTextWritingPredictionInput({
      maxCompletionTokens: 1200,
      modelId: providerModel,
      prompt: createCliDemoGuidePrompt({ product, request }),
      systemPrompt,
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete demo guide generation.",
    prediction,
    replicate,
  });

  try {
    return {
      guide: createCliDemoWalkthroughGuide({
        createdAt,
        output: parseCliDemoGuideGenerationOutput(outputText),
        product,
        request,
      }),
      providerModel,
      providerPredictionId: prediction.id,
    };
  } catch (error) {
    const repairPrediction = await replicate.predictions.create({
      model: providerModel,
      input: createTextWritingPredictionInput({
        maxCompletionTokens: 1200,
        modelId: providerModel,
        prompt: createCliDemoGuideRepairPrompt({
          errorMessage:
            error instanceof Error ? error.message : "Unknown parse error.",
          outputText,
          request,
        }),
        systemPrompt,
      }),
    });
    const repairOutputText = await getCompletedReplicatePredictionOutputText({
      failureMessage: "Replicate did not repair demo guide generation.",
      prediction: repairPrediction as Prediction,
      replicate,
    });

    return {
      guide: createCliDemoWalkthroughGuide({
        createdAt,
        output: parseCliDemoGuideGenerationOutput(repairOutputText),
        product,
        request,
      }),
      providerModel,
      providerPredictionId: repairPrediction.id,
    };
  }
}
