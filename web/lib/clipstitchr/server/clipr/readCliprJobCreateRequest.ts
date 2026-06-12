import { createId } from "@/lib/clipstitchr/utils/createId";
import { cliprScriptIdeaMaxLength } from "@/lib/clipstitchr/constants/cliprScriptIdeaMaxLength";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
import { getCliprGenerationMode } from "@/lib/clipstitchr/utils/getCliprGenerationMode";
import { getCliprLipSyncModelId } from "@/lib/clipstitchr/server/getCliprLipSyncModelId";
import { getCliprResolvedGenerationMode } from "@/lib/clipstitchr/utils/getCliprResolvedGenerationMode";
import { getCliprTtsModelId } from "@/lib/clipstitchr/server/getCliprTtsModelId";
import { getCliprVideoModelId } from "@/lib/clipstitchr/utils/getCliprVideoModelId";
import { getCliprVisualDurationSeconds } from "@/lib/clipstitchr/utils/getCliprVisualDurationSeconds";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";
import { getResolvedCliprVideoModelId } from "@/lib/clipstitchr/utils/getResolvedCliprVideoModelId";
import { sanitizeAvatarSceneControl } from "@/lib/clipstitchr/utils/sanitizeAvatarSceneControl";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";

type CliprJobCreateRequestBody = {
  addMusic?: unknown;
  avatarId?: unknown;
  avatarSceneLocation?: unknown;
  avatarSceneOutfit?: unknown;
  avatarScenePose?: unknown;
  durationSeconds?: unknown;
  generationMode?: unknown;
  jobId?: unknown;
  musicTrackId?: unknown;
  productId?: unknown;
  scriptIdea?: unknown;
  videoModelId?: unknown;
  voiceId?: unknown;
};

function getStringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function readCliprJobCreateRequest(
  request: Request,
): Promise<CliprJobCreateInput> {
  const body = (await request.json()) as CliprJobCreateRequestBody;
  const musicTrackId = getStringValue(body.musicTrackId);
  const requestedJobId = getStringValue(body.jobId);
  const jobId = requestedJobId ? requestedJobId.slice(0, 128) : createId();
  const requestedGenerationMode = getCliprGenerationMode(body.generationMode);
  const generationMode = getCliprResolvedGenerationMode({
    jobId,
    mode: requestedGenerationMode,
  });
  const requestedVideoModelId = getCliprVideoModelId(body.videoModelId);
  const durationSeconds =
    generationMode === "script"
      ? getCliprDurationSeconds(body.durationSeconds)
      : getCliprVisualDurationSeconds(body.durationSeconds);

  return {
    addMusic: generationMode === "script" && body.addMusic === true && !musicTrackId,
    avatarId: getStringValue(body.avatarId),
    avatarSceneLocation:
      sanitizeAvatarSceneControl(body.avatarSceneLocation) || undefined,
    avatarSceneOutfit:
      sanitizeAvatarSceneControl(body.avatarSceneOutfit) || undefined,
    avatarScenePose:
      sanitizeAvatarSceneControl(body.avatarScenePose) || undefined,
    durationSeconds,
    generationMode,
    jobId,
    lipSyncModelId: getCliprLipSyncModelId(),
    musicTrackId: generationMode === "script" ? musicTrackId : "",
    productId: getStringValue(body.productId),
    requestedGenerationMode,
    requestedVideoModelId,
    scriptIdea:
      generationMode === "script"
        ? getStringValue(body.scriptIdea).slice(0, cliprScriptIdeaMaxLength) ||
          undefined
        : undefined,
    ttsModelId: getCliprTtsModelId(),
    videoModelId: getResolvedCliprVideoModelId({
      mode: generationMode,
      requestedModelId: requestedVideoModelId,
    }),
    voiceId: getCliprVoiceId(body.voiceId),
  };
}
