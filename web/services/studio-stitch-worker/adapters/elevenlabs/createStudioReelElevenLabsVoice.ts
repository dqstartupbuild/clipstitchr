import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { StudioStitchTalkingVideoRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchTalkingVideoRecipeV1";
import { fitStudioStitchWordTimings } from "../../../../lib/clipstitchr/studio/stitch/fitStudioStitchWordTimings";
import type { StudioReelCommandRunner } from "../../contracts/StudioReelCommandRunner";
import type { StudioReelVoiceArtifact } from "../../contracts/StudioReelVoiceArtifact";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { readStudioReelProviderJson } from "../providers/readStudioReelProviderJson";
import { probeStudioReelAudioDuration } from "../media/probeStudioReelAudioDuration";
import { createStudioReelLocalInputArgs } from "../render/createStudioReelLocalInputArgs";
import { createStudioReelTempoFilter } from "./createStudioReelTempoFilter";
import { readElevenLabsWordTimings } from "./readElevenLabsWordTimings";

export async function createStudioReelElevenLabsVoice(input: {
  apiKey: string;
  fetch?: typeof fetch;
  ffmpegPath: string;
  ffprobePath: string;
  recipe: StudioStitchTalkingVideoRecipeV1;
  runner: StudioReelCommandRunner;
  workspacePath: string;
}): Promise<StudioReelVoiceArtifact> {
  const request = input.fetch ?? fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await request(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(input.recipe.voice.voiceId)}/with-timestamps`,
      {
        body: JSON.stringify({
          model_id: input.recipe.voice.modelId,
          output_format: "mp3_44100_128",
          text: input.recipe.voice.script,
          voice_settings: {
            similarity_boost: input.recipe.voice.similarityBoost,
            speaker_boost: input.recipe.voice.speakerBoost,
            speed: input.recipe.voice.speed,
            stability: input.recipe.voice.stability,
            style: input.recipe.voice.style,
          },
        }),
        headers: {
          "content-type": "application/json",
          "xi-api-key": input.apiKey,
        },
        method: "POST",
        redirect: "error",
        signal: controller.signal,
      },
    );
    const payload = await readStudioReelProviderJson(response, "ElevenLabs");
    if (
      typeof payload.audio_base64 !== "string" ||
      payload.audio_base64.length > 48 * 1024 * 1024
    ) {
      throw new StudioReelWorkerError({
        code: "ELEVENLABS_AUDIO_INVALID",
        kind: "permanent",
        publicMessage: "ElevenLabs did not return usable voice audio.",
      });
    }
    const audio = Buffer.from(payload.audio_base64, "base64");
    if (audio.byteLength < 1 || audio.byteLength > 32 * 1024 * 1024) {
      throw new StudioReelWorkerError({
        code: "ELEVENLABS_AUDIO_INVALID",
        kind: "permanent",
        publicMessage: "ElevenLabs returned an unsupported voice audio size.",
      });
    }
    const rawPath = join(input.workspacePath, `${input.recipe.id}-voice-raw.mp3`);
    const fittedPath = join(input.workspacePath, `${input.recipe.id}-voice.m4a`);
    await writeFile(rawPath, audio, { flag: "wx", mode: 0o600 });
    const rawDurationSeconds = await probeStudioReelAudioDuration({
      ffprobePath: input.ffprobePath,
      localPath: rawPath,
      runner: input.runner,
      workspacePath: input.workspacePath,
    });
    const tempoFactor = rawDurationSeconds / input.recipe.voice.targetDurationSeconds;
    if (!Number.isFinite(tempoFactor) || tempoFactor < 0.25 || tempoFactor > 4) {
      throw new StudioReelWorkerError({
        code: "VOICE_DURATION_OUT_OF_RANGE",
        kind: "permanent",
        publicMessage: "The generated voice cannot be safely fit to this recipe.",
      });
    }
    await input.runner({
      args: [
        "-y",
        ...createStudioReelLocalInputArgs(rawPath),
        "-filter:a",
        createStudioReelTempoFilter(tempoFactor),
        "-t",
        input.recipe.voice.targetDurationSeconds.toFixed(6),
        "-c:a",
        "aac",
        "-b:a",
        "192k",
        fittedPath,
      ],
      command: input.ffmpegPath,
      cwd: input.workspacePath,
      timeoutMs: 180_000,
    });
    const sourceWordTimings = readElevenLabsWordTimings(
      payload.normalized_alignment ?? payload.alignment,
    );
    return {
      localPath: fittedPath,
      rawDurationSeconds,
      tempoFactor,
      timelineWordTimings: fitStudioStitchWordTimings(
        sourceWordTimings,
        tempoFactor,
      ),
    };
  } catch (error) {
    if (error instanceof StudioReelWorkerError) throw error;
    throw new StudioReelWorkerError({
      cause: error,
      code: "ELEVENLABS_UNAVAILABLE",
      kind: "retryable",
      publicMessage: "ElevenLabs is temporarily unavailable.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
