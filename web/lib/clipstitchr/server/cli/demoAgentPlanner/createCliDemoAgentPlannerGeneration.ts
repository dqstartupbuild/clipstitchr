import type { CliDemoAgentPlanRequest } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlanRequest";
import { createCliDemoAgentPlannerPrompt } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/createCliDemoAgentPlannerPrompt";
import { getCliDemoAgentPlannerSystemPrompt } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/getCliDemoAgentPlannerSystemPrompt";
import { parseCliDemoAgentPlannerAction } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/parseCliDemoAgentPlannerAction";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getTextWritingModelId } from "@/lib/clipstitchr/server/getTextWritingModelId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createCliDemoAgentPlannerGeneration({
  replicate,
  request,
}: {
  replicate: ReplicateClient;
  request: CliDemoAgentPlanRequest;
}) {
  const providerModel = getTextWritingModelId();
  const prediction = await replicate.predictions.create({
    model: providerModel,
    input: createTextWritingPredictionInput({
      maxCompletionTokens: 500,
      modelId: providerModel,
      prompt: createCliDemoAgentPlannerPrompt(request),
      systemPrompt: getCliDemoAgentPlannerSystemPrompt(),
    }),
  });
  const outputText = await getCompletedReplicatePredictionOutputText({
    failureMessage: "Replicate did not complete demo agent planning.",
    prediction,
    replicate,
  });

  return {
    action: parseCliDemoAgentPlannerAction(outputText),
    providerModel,
    providerPredictionId: prediction.id,
  };
}
