import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { assertCliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/assertCliprJobCreateInput";
import { consumeCliprJobStartRateLimits } from "@/lib/clipstitchr/server/clipr/consumeCliprJobStartRateLimits";
import { createCliprJobAvatarImageOutput } from "@/lib/clipstitchr/server/clipr/createCliprJobAvatarImageOutput";
import { createCliprJobAvatarVideoOutput } from "@/lib/clipstitchr/server/clipr/createCliprJobAvatarVideoOutput";
import { createCliprJobScriptPlan } from "@/lib/clipstitchr/server/clipr/createCliprJobScriptPlan";
import { createQueuedCliprJobRecord } from "@/lib/clipstitchr/server/clipr/createQueuedCliprJobRecord";
import { loadCliprJobInputDocuments } from "@/lib/clipstitchr/server/clipr/loadCliprJobInputDocuments";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";

type RunCliprJobCreationOptions = CliprJobServerContext & {
  input: CliprJobCreateInput;
  userId: string;
};

export async function runCliprJobCreation({
  convex,
  input,
  secret,
  userId,
}: RunCliprJobCreationOptions) {
  assertCliprJobCreateInput(input);

  await consumeCliprJobStartRateLimits({ convex, input, secret });

  const documents = await loadCliprJobInputDocuments({ convex, input });
  const createdAt = new Date().toISOString();

  await createQueuedCliprJobRecord({
    convex,
    createdAt,
    documents,
    input,
    secret,
  });

  const replicate = createReplicateClient();
  const textGeneration = await createCliprJobScriptPlan({
    convex,
    input,
    product: documents.product,
    replicate,
    secret,
  });
  const avatarImageOutput = await createCliprJobAvatarImageOutput({
    convex,
    documents,
    input,
    replicate,
    secret,
    textGeneration,
    userId,
  });

  return await createCliprJobAvatarVideoOutput({
    avatarImageOutput,
    convex,
    documents,
    input,
    replicate,
    secret,
    textGeneration,
    userId,
  });
}
