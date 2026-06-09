import { createCliprAvatarVideo } from "@/lib/clipstitchr/server/createCliprAvatarVideo";
import { createCliprLipSyncVideo } from "@/lib/clipstitchr/server/createCliprLipSyncVideo";
import { createCliprSegmentedLipSyncVideo } from "@/lib/clipstitchr/server/createCliprSegmentedLipSyncVideo";
import { createCliprSpeech } from "@/lib/clipstitchr/server/createCliprSpeech";
import { createReplicateClient } from "@/lib/clipstitchr/server/createReplicateClient";
import { getCliprLipSyncSegmentSeconds } from "@/lib/clipstitchr/server/getCliprLipSyncSegmentSeconds";
import { getR2DownloadSignedUrl } from "@/lib/clipstitchr/server/r2/getR2DownloadSignedUrl";
import { saveCliprAvatarVideoObject } from "@/lib/clipstitchr/server/saveCliprAvatarVideoObject";
import { saveCliprSpeechObject } from "@/lib/clipstitchr/server/saveCliprSpeechObject";
import type { CliprDurationSeconds } from "@/lib/clipstitchr/types/CliprDurationSeconds";
import type { CliprLipSyncModelId } from "@/lib/clipstitchr/types/CliprLipSyncModelId";
import type { CliprTtsModelId } from "@/lib/clipstitchr/types/CliprTtsModelId";

type ReplicateClient = ReturnType<typeof createReplicateClient>;

type CreateCliprSyncedAvatarVideoOutputOptions = {
  imageUrl: string;
  jobId: string;
  lipSyncModelId: CliprLipSyncModelId;
  replicate: ReplicateClient;
  script: string;
  targetDurationSeconds: CliprDurationSeconds;
  ttsModelId: CliprTtsModelId;
  userId: string;
  voiceId: string;
};

export async function createCliprSyncedAvatarVideoOutput({
  imageUrl,
  jobId,
  lipSyncModelId,
  replicate,
  script,
  targetDurationSeconds,
  ttsModelId,
  userId,
  voiceId,
}: CreateCliprSyncedAvatarVideoOutputOptions) {
  const generatedSpeech = await createCliprSpeech({
    modelId: ttsModelId,
    replicate,
    script,
    voiceId,
  });
  const speechObject = generatedSpeech
    ? await saveCliprSpeechObject({
        body: generatedSpeech.body,
        contentType: generatedSpeech.contentType,
        jobId,
        userId,
      })
    : null;

  if (!generatedSpeech && lipSyncModelId !== "none") {
    throw new Error("Clipr lip sync requires ElevenLabs speech generation.");
  }

  const avatarSpeechUrl = speechObject
    ? await getR2DownloadSignedUrl(speechObject.key)
    : null;
  const generatedAvatarVideo = await createCliprAvatarVideo({
    audioUrl: avatarSpeechUrl?.url,
    imageUrl,
    replicate,
    script,
    voiceId,
  });
  const sourceAvatarVideoObject = await saveCliprAvatarVideoObject({
    body: generatedAvatarVideo.body,
    contentType: generatedAvatarVideo.contentType,
    jobId,
    userId,
  });
  const activeLipSyncModelId =
    lipSyncModelId === "none" ? null : lipSyncModelId;

  if (!activeLipSyncModelId || !generatedSpeech || !speechObject) {
    return {
      avatarVideoObject: sourceAvatarVideoObject,
      avatarVideoProviderPredictionId: generatedAvatarVideo.predictionId,
      providerModels: [
        ...(generatedSpeech ? [generatedSpeech.modelId] : []),
        generatedAvatarVideo.modelId,
      ],
    };
  }

  const [sourceVideoUrl, speechUrl] = await Promise.all([
    getR2DownloadSignedUrl(sourceAvatarVideoObject.key),
    getR2DownloadSignedUrl(speechObject.key),
  ]);
  const segmentSeconds = getCliprLipSyncSegmentSeconds(activeLipSyncModelId);
  const generatedLipSyncVideo = segmentSeconds
    ? await createCliprSegmentedLipSyncVideo({
        audioBody: generatedSpeech.body,
        audioContentType: generatedSpeech.contentType,
        jobId,
        modelId: activeLipSyncModelId,
        replicate,
        sourceVideoBody: generatedAvatarVideo.body,
        sourceVideoContentType: generatedAvatarVideo.contentType,
        targetDurationSeconds,
        userId,
      })
    : await createCliprLipSyncVideo({
        audioUrl: speechUrl.url,
        modelId: activeLipSyncModelId,
        replicate,
        videoUrl: sourceVideoUrl.url,
      });
  const lipSyncedAvatarVideoObject = await saveCliprAvatarVideoObject({
    body: generatedLipSyncVideo.body,
    contentType: generatedLipSyncVideo.contentType,
    jobId: `${jobId}-lip-sync`,
    userId,
  });

  return {
    avatarVideoObject: lipSyncedAvatarVideoObject,
    avatarVideoProviderPredictionId: generatedLipSyncVideo.predictionId,
    providerModels: [
      generatedSpeech.modelId,
      generatedAvatarVideo.modelId,
      generatedLipSyncVideo.modelId,
    ],
  };
}
