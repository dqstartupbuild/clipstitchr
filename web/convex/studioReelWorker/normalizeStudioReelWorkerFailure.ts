import type { StudioReelWorkerFailure } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerFailure";

export function normalizeStudioReelWorkerFailure(
  failure: StudioReelWorkerFailure,
): StudioReelWorkerFailure {
  const code = failure.code.trim().toUpperCase();
  if (!/^[A-Z0-9_]{1,64}$/.test(code)) {
    throw new Error("Studio Stitch failure code is invalid.");
  }
  if (!new Set(["permanent", "retryable", "uncertain"]).has(failure.kind)) {
    throw new Error("Studio Stitch failure kind is invalid.");
  }
  const message = failure.message
    .replace(/(?:bearer|token|secret|api[_ -]?key)\s*[:=]\s*\S+/gi, "[redacted]")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 240);
  if (!message) throw new Error("Studio Stitch failure message is required.");
  return { code, kind: failure.kind, message };
}
