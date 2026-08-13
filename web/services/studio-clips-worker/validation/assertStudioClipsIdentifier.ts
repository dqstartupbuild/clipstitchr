import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";

export function assertStudioClipsIdentifier(
  value: unknown,
  label: string,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length < 1 ||
    value.length > STUDIO_CLIPS_LIMITS.identifierCharacters ||
    !/^[A-Za-z0-9:_-]+$/.test(value)
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_PIPELINE_ARTIFACT",
      kind: "permanent",
      publicMessage: `${label} is invalid.`,
    });
  }
}
