import { api } from "@/convex/_generated/api";
import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";
import type { CliprTextGeneration } from "@/lib/clipstitchr/types/CliprTextGeneration";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprJobScriptPlanOptions = CliprJobServerContext & {
  input: CliprJobCreateInput;
  product: ProductProfile;
  replicate: ReplicateClient;
};

export async function createCliprJobScriptPlan({
  convex,
  input,
  product,
  replicate,
  secret,
}: CreateCliprJobScriptPlanOptions): Promise<CliprTextGeneration> {
  const textGeneration = await createCliprTextGeneration({
    durationSeconds: input.durationSeconds,
    product,
    purpose: "clipr",
    replicate,
    slideCount: 4,
  });

  await convex.mutation(api.cliprJobs.applyScriptPlan, {
    secret,
    id: input.jobId,
    hookStyleKey: textGeneration.hookStyleKey,
    hookTemplateId: textGeneration.hookTemplateId,
    filledHook: textGeneration.filledHook,
    variablesUsed: textGeneration.variablesUsed,
    script: textGeneration.script,
    scenePlan: textGeneration.scenePlan,
    providerModel: textGeneration.providerModel,
    updatedAt: new Date().toISOString(),
  });

  return textGeneration;
}
