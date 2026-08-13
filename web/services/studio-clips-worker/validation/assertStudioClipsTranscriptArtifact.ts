import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import type { StudioClipsTranscriptArtifact } from "../contracts/StudioClipsTranscriptArtifact";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsTranscriptArtifact(
  value: unknown,
): asserts value is StudioClipsTranscriptArtifact {
  if (!getStudioClipsValueIsRecord(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_TRANSCRIPT",
      kind: "permanent",
      publicMessage: "The transcript result could not be validated.",
    });
  }

  assertStudioClipsExactKeys(value, ["languageCode", "text"], "Transcript");

  if (
    typeof value.text !== "string" ||
    value.text.trim().length === 0 ||
    value.text.length > STUDIO_CLIPS_LIMITS.transcriptCharacters ||
    (value.languageCode !== undefined &&
      (typeof value.languageCode !== "string" ||
        !/^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{2,8})?$/.test(value.languageCode)))
  ) {
    throw new StudioClipsWorkerError({
      code: "INVALID_TRANSCRIPT",
      kind: "permanent",
      publicMessage: "The transcript result could not be validated.",
    });
  }
}
