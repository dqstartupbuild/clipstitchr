import { redactStudioClipsSensitiveValue } from "../security/redactStudioClipsSensitiveValue";
import type { StudioClipsWorkerClaimResult } from "../runtime/StudioClipsWorkerClaimResult";
import type { StudioClipsWorkerCommandIO } from "./StudioClipsWorkerCommandIO";

export function writeStudioClipsWorkerResult(
  io: StudioClipsWorkerCommandIO,
  result: StudioClipsWorkerClaimResult,
): void {
  io.stdout(JSON.stringify(redactStudioClipsSensitiveValue(result)));
}
