import type { StudioStitchWordTiming } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchWordTiming";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { flushElevenLabsWordTiming } from "./flushElevenLabsWordTiming";

export function readElevenLabsWordTimings(
  alignment: unknown,
): StudioStitchWordTiming[] {
  if (!alignment || Array.isArray(alignment) || typeof alignment !== "object") {
    throw new StudioReelWorkerError({
      code: "ELEVENLABS_ALIGNMENT_INVALID",
      kind: "permanent",
      publicMessage: "ElevenLabs did not return usable word timings.",
    });
  }
  const value = alignment as Record<string, unknown>;
  const characters = value.characters;
  const starts = value.character_start_times_seconds;
  const ends = value.character_end_times_seconds;
  if (
    !Array.isArray(characters) ||
    !Array.isArray(starts) ||
    !Array.isArray(ends) ||
    characters.length === 0 ||
    characters.length !== starts.length ||
    characters.length !== ends.length ||
    characters.length > 20_000
  ) {
    throw new StudioReelWorkerError({
      code: "ELEVENLABS_ALIGNMENT_INVALID",
      kind: "permanent",
      publicMessage: "ElevenLabs did not return usable word timings.",
    });
  }
  const timings: StudioStitchWordTiming[] = [];
  const timingState = { endSeconds: 0, startSeconds: 0, word: "" };
  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    const start = starts[index];
    const end = ends[index];
    if (
      typeof character !== "string" ||
      [...character].length !== 1 ||
      typeof start !== "number" ||
      typeof end !== "number" ||
      !Number.isFinite(start) ||
      !Number.isFinite(end) ||
      start < 0 ||
      end <= start ||
      (index > 0 && start < Number(starts[index - 1]))
    ) {
      throw new StudioReelWorkerError({
        code: "ELEVENLABS_ALIGNMENT_INVALID",
        kind: "permanent",
        publicMessage: "ElevenLabs returned malformed word timings.",
      });
    }
    if (/\s/u.test(character)) flushElevenLabsWordTiming(timings, timingState);
    else {
      if (!timingState.word) timingState.startSeconds = start;
      timingState.word += character;
      timingState.endSeconds = end;
    }
  }
  flushElevenLabsWordTiming(timings, timingState);
  if (timings.length === 0) {
    throw new StudioReelWorkerError({
      code: "ELEVENLABS_ALIGNMENT_EMPTY",
      kind: "permanent",
      publicMessage: "ElevenLabs returned no spoken word timings.",
    });
  }
  return timings;
}
