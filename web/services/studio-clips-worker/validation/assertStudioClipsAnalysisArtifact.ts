import type { StudioClipsAnalysisArtifact } from "../contracts/StudioClipsAnalysisArtifact";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsExactKeys } from "./assertStudioClipsExactKeys";
import { assertStudioClipsJsonValue } from "./assertStudioClipsJsonValue";
import { getStudioClipsValueIsRecord } from "./getStudioClipsValueIsRecord";

export function assertStudioClipsAnalysisArtifact(
  value: unknown,
): asserts value is StudioClipsAnalysisArtifact {
  if (!getStudioClipsValueIsRecord(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_ANALYSIS",
      kind: "permanent",
      publicMessage: "The clip analysis result could not be validated.",
    });
  }

  assertStudioClipsExactKeys(value, ["payload", "snapshotVersion"], "Analysis");

  if (value.snapshotVersion !== 1) {
    throw new StudioClipsWorkerError({
      code: "INVALID_ANALYSIS",
      kind: "permanent",
      publicMessage: "The clip analysis version is unsupported.",
    });
  }

  assertStudioClipsJsonValue(value.payload);
}
