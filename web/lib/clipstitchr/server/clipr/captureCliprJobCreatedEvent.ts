import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";

type CaptureCliprJobCreatedEventOptions = {
  input: CliprJobCreateInput;
  request: Request;
  userId: string;
};

export async function captureCliprJobCreatedEvent({
  input,
  request,
  userId,
}: CaptureCliprJobCreatedEventOptions) {
  await capturePostHogServerEvent({
    distinctId: userId,
    event: "clipr_job_created",
    properties: {
      job_id: input.jobId,
      product_id: input.productId,
      avatar_id: input.avatarId,
      duration_seconds: input.durationSeconds,
      voice_id: input.voiceId,
      has_music: Boolean(input.musicTrackId || input.addMusic),
    },
    request,
  });
}
