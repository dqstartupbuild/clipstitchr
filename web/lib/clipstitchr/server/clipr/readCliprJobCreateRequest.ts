import { createId } from "@/lib/clipstitchr/utils/createId";
import { getCliprDurationSeconds } from "@/lib/clipstitchr/utils/getCliprDurationSeconds";
import { getCliprVoiceId } from "@/lib/clipstitchr/utils/getCliprVoiceId";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";

type CliprJobCreateRequestBody = {
  addMusic?: unknown;
  avatarId?: unknown;
  durationSeconds?: unknown;
  jobId?: unknown;
  musicTrackId?: unknown;
  productId?: unknown;
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
    durationSeconds: getCliprDurationSeconds(body.durationSeconds),
    jobId: requestedJobId ? requestedJobId.slice(0, 128) : createId(),
    musicTrackId,
    productId: getStringValue(body.productId),
    voiceId: getCliprVoiceId(body.voiceId),
  };
}
