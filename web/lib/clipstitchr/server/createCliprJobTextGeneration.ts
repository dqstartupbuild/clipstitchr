import { createCliprTextGeneration } from "@/lib/clipstitchr/server/createCliprTextGeneration";
import { createCliprVisualTextGeneration } from "@/lib/clipstitchr/server/createCliprVisualTextGeneration";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprResolvedGenerationMode } from "@/lib/clipstitchr/types/CliprResolvedGenerationMode";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprJobTextGenerationOptions = {
  durationSeconds: CliprDurationSeconds;
  generationMode: Exclude<CliprResolvedGenerationMode, "demo">;
  jobId: string;
  product: ProductProfile;
  replicate: ReplicateClient;
  scriptIdea?: string;
};

export async function createCliprJobTextGeneration({
  durationSeconds,
  generationMode,
  jobId,
  product,
  replicate,
  scriptIdea,
}: CreateCliprJobTextGenerationOptions) {
  if (generationMode === "script") {
    return await createCliprTextGeneration({
      durationSeconds,
      product,
      purpose: "clipr",
      replicate,
      scriptIdea,
      slideCount: 4,
    });
  }

  return createCliprVisualTextGeneration({
    durationSeconds,
    jobId,
    mode: generationMode,
    product,
  });
}
