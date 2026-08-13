import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import type { StudioStitchRecipeV1 } from "../../../../lib/clipstitchr/types/studioStitch/StudioStitchRecipeV1";
import type { StudioReelGeminiAnalysis } from "../../contracts/StudioReelGeminiAnalysis";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { readStudioReelProviderJson } from "../providers/readStudioReelProviderJson";
import { assertStudioReelGeminiUrl } from "./assertStudioReelGeminiUrl";
import { createStudioReelGeminiPrompt } from "./createStudioReelGeminiPrompt";
import { fetchStudioReelGemini } from "./fetchStudioReelGemini";
import { readStudioReelGeminiAnalysis } from "./readStudioReelGeminiAnalysis";
import { readStudioReelGeminiText } from "./readStudioReelGeminiText";

export async function createStudioReelGeminiAnalysis(input: {
  apiKey: string;
  assertActive: () => Promise<void>;
  contentType: string;
  fetch?: typeof fetch;
  localPath: string;
  recipe: StudioStitchRecipeV1;
}): Promise<StudioReelGeminiAnalysis> {
  const file = await stat(input.localPath);
  if (!file.isFile() || file.size < 1 || file.size > 2 * 1024 * 1024 * 1024) {
    throw new StudioReelWorkerError({
      code: "GEMINI_SOURCE_INVALID",
      kind: "permanent",
      publicMessage: "The Gemini demo source is invalid.",
    });
  }
  await input.assertActive();
  const start = await fetchStudioReelGemini({
    fetch: input.fetch,
    url: "https://generativelanguage.googleapis.com/upload/v1beta/files",
    init: {
      body: JSON.stringify({ file: { display_name: input.recipe.id } }),
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": input.apiKey,
        "x-goog-upload-command": "start",
        "x-goog-upload-header-content-length": String(file.size),
        "x-goog-upload-header-content-type": input.contentType,
        "x-goog-upload-protocol": "resumable",
      },
      method: "POST",
      redirect: "error",
    },
  });
  if (!start.ok) await readStudioReelProviderJson(start, "Gemini", 64 * 1024);
  const uploadHeader = start.headers.get("x-goog-upload-url");
  if (!uploadHeader) {
    throw new StudioReelWorkerError({
      code: "GEMINI_UPLOAD_SESSION_MISSING",
      kind: "retryable",
      publicMessage: "Gemini did not create an upload session.",
    });
  }
  const uploadUrl = assertStudioReelGeminiUrl(uploadHeader, "upload");
  await input.assertActive();
  const upload = await fetchStudioReelGemini({
    fetch: input.fetch,
    timeoutMs: 300_000,
    url: uploadUrl,
    init: {
      body: createReadStream(input.localPath) as unknown as BodyInit,
      headers: {
        "content-length": String(file.size),
        "x-goog-api-key": input.apiKey,
        "x-goog-upload-command": "upload, finalize",
        "x-goog-upload-offset": "0",
      },
      method: "POST",
      redirect: "error",
      duplex: "half",
    },
  });
  const uploaded = await readStudioReelProviderJson(upload, "Gemini", 256 * 1024);
  const fileRecord =
    uploaded.file && typeof uploaded.file === "object" && !Array.isArray(uploaded.file)
      ? (uploaded.file as Record<string, unknown>)
      : uploaded;
  if (typeof fileRecord.uri !== "string") {
    throw new StudioReelWorkerError({
      code: "GEMINI_FILE_URI_MISSING",
      kind: "retryable",
      publicMessage: "Gemini did not return the uploaded demo identity.",
    });
  }
  const fileUri = assertStudioReelGeminiUrl(fileRecord.uri, "file");
  await input.assertActive();
  const generated = await fetchStudioReelGemini({
    fetch: input.fetch,
    url: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    init: {
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { file_data: { file_uri: fileUri, mime_type: input.contentType } },
              { text: createStudioReelGeminiPrompt(input.recipe) },
            ],
            role: "user",
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0,
        },
      }),
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": input.apiKey,
      },
      method: "POST",
      redirect: "error",
    },
  });
  const payload = await readStudioReelProviderJson(generated, "Gemini");
  let result: unknown;
  try {
    result = JSON.parse(readStudioReelGeminiText(payload));
  } catch (error) {
    if (error instanceof StudioReelWorkerError) throw error;
    throw new StudioReelWorkerError({
      code: "GEMINI_ANALYSIS_JSON_INVALID",
      kind: "permanent",
      publicMessage: "Gemini returned invalid grounded analysis JSON.",
    });
  }
  return readStudioReelGeminiAnalysis(result);
}
