import type { CliDemoAgentPlanRequest } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/CliDemoAgentPlanRequest";
import { createCliDemoAgentPlannerPrompt } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/createCliDemoAgentPlannerPrompt";
import { createCliDemoAgentPlannerRepairPrompt } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/createCliDemoAgentPlannerRepairPrompt";
import { getCliDemoAgentPlannerSystemPrompt } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/getCliDemoAgentPlannerSystemPrompt";
import { parseCliDemoAgentPlannerAction } from "@/lib/clipstitchr/server/cli/demoAgentPlanner/parseCliDemoAgentPlannerAction";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { createTextWritingPredictionInput } from "@/lib/clipstitchr/server/createTextWritingPredictionInput";
import { getCompletedReplicatePredictionOutputText } from "@/lib/clipstitchr/server/getCompletedReplicatePredictionOutputText";
import { getCliDemoAgentPlannerModelId } from "@/lib/clipstitchr/server/getCliDemoAgentPlannerModelId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

export async function createCliDemoAgentPlannerGeneration({
  replicate,
  request,
}: {
  replicate: ReplicateClient;
  request: CliDemoAgentPlanRequest;
}) {
  const providerModel = getCliDemoAgentPlannerModelId();
  let invalidOutputText = "";
  let parseErrorMessage = "";

  for (const attempt of [0, 1]) {
    const prediction = await replicate.predictions.create({
      model: providerModel,
      input: createTextWritingPredictionInput({
        maxCompletionTokens: 500,
        modelId: providerModel,
        prompt:
          attempt === 0
            ? createCliDemoAgentPlannerPrompt(request)
            : createCliDemoAgentPlannerRepairPrompt({
                invalidOutputText,
                parseErrorMessage,
                request,
              }),
        systemPrompt: getCliDemoAgentPlannerSystemPrompt(),
        temperature: 0.2,
      }),
    });
    const outputText = await getCompletedReplicatePredictionOutputText({
      failureMessage: "Replicate did not complete demo agent planning.",
      prediction,
      replicate,
    });

    try {
      return {
        action: parseCliDemoAgentPlannerAction(outputText),
        providerModel,
        providerPredictionId: prediction.id,
      };
    } catch (error) {
      invalidOutputText = outputText;
      parseErrorMessage =
        error instanceof Error ? error.message : "Planner output was invalid.";
    }
  }

  throw new Error(parseErrorMessage || "Planner output was invalid.");
}
