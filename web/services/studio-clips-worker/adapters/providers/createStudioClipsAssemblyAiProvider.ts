import { createReadStream } from "node:fs";
import { setTimeout as wait } from "node:timers/promises";
import type { StudioClipsWorkerRuntimeConfig } from "../../runtime/StudioClipsWorkerRuntimeConfig";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import type { AssemblyAiWord } from "./AssemblyAiWord";
import { formatStudioClipsAssemblyTimestamp } from "./formatStudioClipsAssemblyTimestamp";
import { formatStudioClipsAssemblyWords } from "./formatStudioClipsAssemblyWords";
import { normalizeStudioClipsLanguageCode } from "./normalizeStudioClipsLanguageCode";
import { readStudioClipsProviderJson } from "./readStudioClipsProviderJson";
import { requestStudioClipsAssemblyAiWithTimeout } from "./requestStudioClipsAssemblyAiWithTimeout";
import type { StudioClipsTranscriptionProvider } from "./StudioClipsTranscriptionProvider";

export function createStudioClipsAssemblyAiProvider(input: {
  config: StudioClipsWorkerRuntimeConfig["assemblyAi"];
  fetch?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
}): StudioClipsTranscriptionProvider {
  const request = input.fetch ?? fetch;
  const sleep = input.sleep ?? wait;
  const headers = { authorization: input.config.apiKey };

  return {
    transcribe: async ({ audioPath }) => {
      const uploadPayload: unknown = await readStudioClipsProviderJson(
        await requestStudioClipsAssemblyAiWithTimeout({
          fetch: request,
          init: {
            body: createReadStream(audioPath) as unknown as BodyInit,
            duplex: "half",
            headers: {
              ...headers,
              "content-type": "application/octet-stream",
            },
            method: "POST",
            redirect: "error",
          },
          timeoutMs: input.config.timeoutMs,
          url: "https://api.assemblyai.com/v2/upload",
        }),
        "AssemblyAI",
      );
      const uploadUrl =
        uploadPayload &&
        typeof uploadPayload === "object" &&
        !Array.isArray(uploadPayload)
          ? (uploadPayload as { upload_url?: unknown }).upload_url
          : undefined;
      if (typeof uploadUrl !== "string") {
        throw new StudioClipsWorkerError({
          code: "INVALID_TRANSCRIPTION_UPLOAD",
          kind: "retryable",
          publicMessage: "AssemblyAI did not accept the transcription audio.",
        });
      }
      const parsedUpload = new URL(uploadUrl);
      if (
        parsedUpload.protocol !== "https:" ||
        parsedUpload.hostname !== "cdn.assemblyai.com" ||
        parsedUpload.username ||
        parsedUpload.password
      ) {
        throw new StudioClipsWorkerError({
          code: "UNSAFE_TRANSCRIPTION_UPLOAD_URL",
          kind: "permanent",
          publicMessage: "AssemblyAI returned an unsupported upload reference.",
        });
      }

      const submitted = await readStudioClipsProviderJson(
        await requestStudioClipsAssemblyAiWithTimeout({
          fetch: request,
          init: {
            body: JSON.stringify({
              audio_url: parsedUpload.toString(),
              format_text: true,
              punctuate: true,
              speaker_labels: true,
              speech_model: "universal",
            }),
            headers: { ...headers, "content-type": "application/json" },
            method: "POST",
            redirect: "error",
          },
          timeoutMs: input.config.timeoutMs,
          url: "https://api.assemblyai.com/v2/transcript",
        }),
        "AssemblyAI",
      );
      const transcriptId =
        submitted && typeof submitted === "object" && !Array.isArray(submitted)
          ? (submitted as { id?: unknown }).id
          : undefined;
      if (
        typeof transcriptId !== "string" ||
        !/^[A-Za-z0-9_-]{8,200}$/.test(transcriptId)
      ) {
        throw new StudioClipsWorkerError({
          code: "INVALID_TRANSCRIPTION_JOB",
          kind: "retryable",
          publicMessage: "AssemblyAI did not return a valid transcription job.",
        });
      }

      const deadline = Date.now() + input.config.timeoutMs;
      while (Date.now() < deadline) {
        const payload = await readStudioClipsProviderJson(
          await requestStudioClipsAssemblyAiWithTimeout({
            fetch: request,
            init: { headers, method: "GET", redirect: "error" },
            timeoutMs: input.config.timeoutMs,
            url: `https://api.assemblyai.com/v2/transcript/${encodeURIComponent(transcriptId)}`,
          }),
          "AssemblyAI",
        );
        if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
          throw new StudioClipsWorkerError({
            code: "INVALID_TRANSCRIPTION_RESPONSE",
            kind: "retryable",
            publicMessage:
              "AssemblyAI returned an invalid transcription state.",
          });
        }
        const transcript = payload as Record<string, unknown>;
        if (transcript.status === "error") {
          throw new StudioClipsWorkerError({
            code: "TRANSCRIPTION_FAILED",
            kind: "permanent",
            publicMessage: "AssemblyAI could not transcribe this video.",
          });
        }
        if (transcript.status === "completed") {
          const utterances = Array.isArray(transcript.utterances)
            ? (transcript.utterances as AssemblyAiWord[])
            : [];
          const lines = utterances
            .filter(
              (utterance) =>
                typeof utterance.start === "number" &&
                typeof utterance.end === "number" &&
                typeof utterance.text === "string",
            )
            .map(
              (utterance) =>
                `[${formatStudioClipsAssemblyTimestamp(utterance.start!)} - ${formatStudioClipsAssemblyTimestamp(utterance.end!)}] ${
                  utterance.speaker ? `Speaker ${utterance.speaker}: ` : ""
                }${utterance.text}`,
            );
          const fallbackWords = Array.isArray(transcript.words)
            ? formatStudioClipsAssemblyWords(
                transcript.words as AssemblyAiWord[],
              )
            : [];
          const text = (lines.length ? lines : fallbackWords).join("\n").trim();
          if (!text) {
            throw new StudioClipsWorkerError({
              code: "EMPTY_TRANSCRIPT",
              kind: "permanent",
              publicMessage: "No spoken transcript was found in this video.",
            });
          }
          const languageCode = normalizeStudioClipsLanguageCode(
            transcript.language_code,
          );
          return { ...(languageCode ? { languageCode } : {}), text };
        }
        if (
          transcript.status !== "queued" &&
          transcript.status !== "processing"
        ) {
          throw new StudioClipsWorkerError({
            code: "INVALID_TRANSCRIPTION_STATUS",
            kind: "retryable",
            publicMessage:
              "AssemblyAI returned an unsupported transcription state.",
          });
        }
        await sleep(input.config.pollIntervalMs);
      }
      throw new StudioClipsWorkerError({
        code: "TRANSCRIPTION_TIMEOUT",
        kind: "retryable",
        publicMessage: "AssemblyAI transcription timed out.",
      });
    },
  };
}
