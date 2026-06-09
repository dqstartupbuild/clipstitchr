import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";

type ActiveCliprLipSyncModelId = Exclude<CliprLipSyncModelId, "none">;

type CreateCliprLipSyncVideoInputOptions = {
  audioUrl: string;
  modelId: ActiveCliprLipSyncModelId;
  videoUrl: string;
};

export function createCliprLipSyncVideoInput({
  audioUrl,
  modelId,
  videoUrl,
}: CreateCliprLipSyncVideoInputOptions) {
  if (
    modelId ===
    "bytedance/latentsync:637ce1919f807ca20da3a448ddc2743535d2853649574cd52a933120e9b9e293"
  ) {
    return {
      audio: audioUrl,
      guidance_scale: 1,
      seed: 0,
      video: videoUrl,
    };
  }

  return {
    audio: audioUrl,
    video: videoUrl,
  };
}
