import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";

export function readStudioClipsAnalysisScore(
  value: unknown,
): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new StudioClipsWorkerError({
      code: "INVALID_ANALYSIS_CANDIDATE",
      kind: "permanent",
      publicMessage: "The clip analysis scores could not be validated.",
    });
  }
  const score = value as Record<string, unknown>;
  const result: Record<string, number> = {};
  for (const key of ["clarity", "hook", "overall", "retention", "shareability"]) {
    const candidate = score[key];
    if (
      typeof candidate !== "number" ||
      !Number.isFinite(candidate) ||
      candidate < 0 ||
      candidate > 100
    ) {
      throw new StudioClipsWorkerError({
        code: "INVALID_ANALYSIS_CANDIDATE",
        kind: "permanent",
        publicMessage: "The clip analysis scores could not be validated.",
      });
    }
    result[key] = candidate;
  }
  return result;
}
