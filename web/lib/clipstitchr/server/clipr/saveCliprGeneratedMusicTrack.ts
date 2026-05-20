import { api } from "@/convex/_generated/api";
import { createCliprMusic } from "@/lib/clipstitchr/server/createCliprMusic";
import type { CliprJobServerContext } from "@/lib/clipstitchr/server/clipr/CliprJobServerContext";
import type { CliprMusicMetadata } from "@/lib/clipstitchr/types/CliprMusicMetadata";
import type { R2ObjectReference } from "@/lib/clipstitchr/types/R2ObjectReference";

type CliprGeneratedMusic = Awaited<ReturnType<typeof createCliprMusic>>;

type SaveCliprGeneratedMusicTrackOptions = Pick<
  CliprJobServerContext,
  "convex"
> & {
  generatedMusic: CliprGeneratedMusic;
  metadata: CliprMusicMetadata;
  musicObject: R2ObjectReference;
  sharedMusicObject: R2ObjectReference;
  trackId: string;
  productName: string;
  recordedAt: string;
};

export async function saveCliprGeneratedMusicTrack({
  convex,
  generatedMusic,
  metadata,
  musicObject,
  productName,
  recordedAt,
  sharedMusicObject,
  trackId,
}: SaveCliprGeneratedMusicTrackOptions) {
  await convex.mutation(api.sharedMusicTracks.save, {
    id: trackId,
    title: metadata.title ?? "",
    tags: metadata.tags ?? [],
    style: productName,
    durationSeconds: generatedMusic.durationSeconds,
    audioObject: sharedMusicObject,
    ownerAudioObject: musicObject,
    mimeType: generatedMusic.contentType,
    size: generatedMusic.body.byteLength,
    prompt: generatedMusic.prompt,
    providerModel: generatedMusic.modelId,
    providerPredictionId: generatedMusic.predictionId,
    source: "clipr",
    createdAt: recordedAt,
  });
}
