import { STUDIO_CLIPS_LIMITS } from "../constants/studioClipsLimits";
import type { StudioClipsJsonValue } from "../contracts/StudioClipsJsonValue";
import { StudioClipsWorkerError } from "../errors/StudioClipsWorkerError";
import { assertStudioClipsJsonNode } from "./assertStudioClipsJsonNode";

export function assertStudioClipsJsonValue(
  value: unknown,
): asserts value is StudioClipsJsonValue {
  try {
    assertStudioClipsJsonNode(value, 0, { nodes: 0 });
    const serialized = JSON.stringify(value);

    if (Buffer.byteLength(serialized) > STUDIO_CLIPS_LIMITS.analysisJsonBytes) {
      throw new Error("JSON byte limit exceeded");
    }
  } catch (cause) {
    throw new StudioClipsWorkerError({
      cause,
      code: "INVALID_ANALYSIS",
      kind: "permanent",
      publicMessage: "The clip analysis result could not be validated.",
    });
  }
}
