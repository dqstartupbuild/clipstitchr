import { createId } from "@/lib/clipstitchr/utils/createId";
import { cliprScriptIdeaMaxLength } from "@/lib/clipstitchr/constants/cliprScriptIdeaMaxLength";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
import { getCliprLipSyncModelId } from "@/lib/clipstitchr/server/getCliprLipSyncModelId";
import { getCliprTtsModelId } from "@/lib/clipstitchr/server/getCliprTtsModelId";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";
import { sanitizeAvatarSceneControl } from "@/lib/clipstitchr/utils/sanitizeAvatarSceneControl";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";

type CliprJobCreateRequestBody = {
  addMusic?: unknown;
  avatarId?: unknown;
  avatarSceneLocation?: unknown;
  avatarSceneOutfit?: unknown;
  avatarScenePose?: unknown;
  durationSeconds?: unknown;
  jobId?: unknown;
  musicTrackId?: unknown;
  productId?: unknown;
  scriptIdea?: unknown;
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

  return {
    addMusic: body.addMusic === true && !musicTrackId,
    avatarId: getStringValue(body.avatarId),
    avatarSceneLocation:
      sanitizeAvatarSceneControl(body.avatarSceneLocation) || undefined,
    avatarSceneOutfit:
      sanitizeAvatarSceneControl(body.avatarSceneOutfit) || undefined,
    avatarScenePose:
      sanitizeAvatarSceneControl(body.avatarScenePose) || undefined,
    durationSeconds: getCliprDurationSeconds(body.durationSeconds),
    jobId: requestedJobId ? requestedJobId.slice(0, 128) : createId(),
    lipSyncModelId: getCliprLipSyncModelId(),
    musicTrackId,
    productId: getStringValue(body.productId),
    scriptIdea:
      getStringValue(body.scriptIdea).slice(0, cliprScriptIdeaMaxLength) ||
      undefined,
    ttsModelId: getCliprTtsModelId(),
    voiceId: getCliprVoiceId(body.voiceId),
  };
}
