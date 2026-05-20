import { createCliprMusic } from "@/lib/clipstitchr/server/createCliprMusic";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";
import { getGeneratedMusicTrackTags } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTags";
import { getGeneratedMusicTrackTitle } from "@/lib/clipstitchr/utils/getGeneratedMusicTrackTitle";

type CliprGeneratedMusic = Awaited<ReturnType<typeof createCliprMusic>>;

type CreateCliprGeneratedMusicMetadataOptions = {
  generatedMusic: CliprGeneratedMusic;
  generatedMusicTrackId: string;
  musicObject: R2ObjectReference;
  productName: string;
  recordedAt: string;
};

export function createCliprGeneratedMusicMetadata({
  generatedMusic,
  generatedMusicTrackId,
  musicObject,
  productName,
  recordedAt,
}: CreateCliprGeneratedMusicMetadataOptions): CliprMusicMetadata {
  return {
    audioObject: musicObject,
    createdAt: recordedAt,
    durationSeconds: generatedMusic.durationSeconds,
    enabled: true,
    prompt: generatedMusic.prompt,
    providerModel: generatedMusic.modelId,
    providerPredictionId: generatedMusic.predictionId,
    sharedTrackId: generatedMusicTrackId,
    tags: getGeneratedMusicTrackTags({
      includeStyleTags: false,
      source: "clipr",
      style: productName,
    }),
    title: getGeneratedMusicTrackTitle({
      source: "clipr",
      style: productName,
      trackId: generatedMusicTrackId,
    }),
    updatedAt: recordedAt,
    volume: 1,
  };
}
