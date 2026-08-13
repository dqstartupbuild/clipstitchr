import type { StudioStitchVoiceInput } from "../../types/studioStitch/StudioStitchVoiceInput";
import type { StudioStitchVoicePlan } from "../../types/studioStitch/StudioStitchVoicePlan";
import { countStudioStitchWords } from "./countStudioStitchWords";
import { fitStudioStitchWordTimings } from "./fitStudioStitchWordTimings";
import { normalizeStudioStitchText } from "./normalizeStudioStitchText";
import { normalizeStudioStitchWordTimings } from "./normalizeStudioStitchWordTimings";

export function createStudioStitchVoicePlan(
  input: StudioStitchVoiceInput,
  scriptValue: string,
  targetDurationSeconds: number,
  groundingClaimIds: readonly string[],
): StudioStitchVoicePlan {
  const voiceId = normalizeStudioStitchText(input.voiceId, "Voice ID", 240);
  const voiceName = normalizeStudioStitchText(
    input.voiceName,
    "Voice name",
    240,
  );
  const modelId = normalizeStudioStitchText(input.modelId, "Voice model ID", 240);
  const script = normalizeStudioStitchText(scriptValue, "Voice script", 8_000);
  if (!Number.isFinite(targetDurationSeconds) || targetDurationSeconds <= 0) {
    throw new Error("Voice target duration must be positive.");
  }
  if (!Number.isFinite(input.speed) || input.speed < 0.5 || input.speed > 2) {
    throw new Error("Voice speed must be between 0.5 and 2.");
  }
  for (const [label, value] of [
    ["stability", input.stability],
    ["similarity boost", input.similarityBoost],
    ["style", input.style],
  ] as const) {
    if (!Number.isFinite(value) || value < 0 || value > 1) {
      throw new Error(`Voice ${label} must be between 0 and 1.`);
    }
  }
  const suppliedTimings = input.wordTimings;
  const inferredRawDuration =
    suppliedTimings && suppliedTimings.length > 0
      ? suppliedTimings[suppliedTimings.length - 1].endSeconds
      : null;
  const rawDurationSeconds = input.rawDurationSeconds ?? inferredRawDuration;
  if (
    rawDurationSeconds !== null &&
    (!Number.isFinite(rawDurationSeconds) || rawDurationSeconds <= 0)
  ) {
    throw new Error("Raw voice duration must be positive when supplied.");
  }
  if (suppliedTimings !== null && rawDurationSeconds === null) {
    throw new Error("Voice word timings require a raw audio duration.");
  }
  const sourceWordTimings =
    suppliedTimings === null
      ? []
      : normalizeStudioStitchWordTimings(
          suppliedTimings,
          rawDurationSeconds as number,
        );
  const tempoFactor =
    rawDurationSeconds === null
      ? null
      : Number((rawDurationSeconds / targetDurationSeconds).toFixed(6));
  const timelineWordTimings =
    tempoFactor === null || sourceWordTimings.length === 0
      ? []
      : fitStudioStitchWordTimings(sourceWordTimings, tempoFactor);
  return {
    voiceId,
    voiceName,
    modelId,
    script,
    speed: input.speed,
    stability: input.stability,
    similarityBoost: input.similarityBoost,
    style: input.style,
    speakerBoost: true,
    targetDurationSeconds,
    rawDurationSeconds,
    tempoFactor,
    timingState: suppliedTimings === null ? "pendingProvider" : "provided",
    sourceWordTimings,
    timelineWordTimings,
    groundingClaimIds: [...groundingClaimIds],
    targetWordCountMinimum: Math.ceil(targetDurationSeconds * 2.5),
    targetWordCountMaximum: Math.floor(targetDurationSeconds * 2.75),
    actualWordCount: countStudioStitchWords(script),
  };
}
