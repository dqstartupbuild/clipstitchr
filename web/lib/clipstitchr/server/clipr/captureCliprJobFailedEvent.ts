import { capturePostHogServerEvent } from "@/lib/clipstitchr/server/analytics/capturePostHogServerEvent";
import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";

type CaptureCliprJobFailedEventOptions = {
  error: unknown;
  input: CliprJobCreateInput;
  request: Request;
  userId: string;
};

export async function captureCliprJobFailedEvent({
  error,
  input,
  request,
  userId,
}: CaptureCliprJobFailedEventOptions) {
  await capturePostHogServerEvent({
    distinctId: userId,
    event: "clipr_job_failed",
    properties: {
      job_id: input.jobId,
      product_id: input.productId,
      avatar_id: input.avatarId,
      error_name: error instanceof Error ? error.name : "UnknownError",
    },
    request,
  });
}
