import { api } from "@/convex/_generated/api";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";
import type { CliprJobInputDocuments } from "@/lib/clipstitchr/server/clipr/CliprJobInputDocuments";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";

type CreateQueuedCliprJobRecordOptions = CliprJobServerContext & {
  createdAt: string;
  documents: CliprJobInputDocuments;
  input: CliprJobCreateInput;
};

export async function createQueuedCliprJobRecord({
  convex,
  createdAt,
  documents,
  input,
  secret,
}: CreateQueuedCliprJobRecordOptions) {
  await convex.mutation(api.cliprJobs.createQueued, {
    secret,
    id: input.jobId,
    productId: documents.product.id,
    productName: documents.product.name,
    productDetails: documents.product.productDetails,
    audienceDetails: documents.product.audienceDetails,
    productInferredProblem: documents.product.inferredProblem,
    productInferredPainPoints: documents.product.inferredPainPoints,
    avatarId: documents.avatar.id,
    avatarName: documents.avatar.name,
    avatarPhotoId: documents.avatarPhoto.id,
    voiceId: input.voiceId,
    targetDurationSeconds: input.durationSeconds,
    createdAt,
  });
}
