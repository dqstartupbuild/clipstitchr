import type { StudioClipsWorkerRuntimeConfig } from "../../runtime/StudioClipsWorkerRuntimeConfig";
import { StudioClipsWorkerError } from "../../errors/StudioClipsWorkerError";
import { readStudioClipsProviderJson } from "../providers/readStudioClipsProviderJson";
import type { StudioClipsAnalysisProvider } from "./StudioClipsAnalysisProvider";
import { createStudioClipsAnalysisPrompt } from "./createStudioClipsAnalysisPrompt";
import { readStudioClipsAnalysisPayload } from "./readStudioClipsAnalysisPayload";
import { readStudioClipsModelText } from "./readStudioClipsModelText";
import { studioClipsAnalysisJsonSchema } from "./studioClipsAnalysisJsonSchema";

export function createStudioClipsAnalysisProvider(input: {
  config: StudioClipsWorkerRuntimeConfig["analysis"];
  fetch?: typeof fetch;
}): StudioClipsAnalysisProvider {
  const request = input.fetch ?? fetch;

  return {
    analyze: async ({ claim, durationSeconds, transcript }) => {
      const prompt = createStudioClipsAnalysisPrompt({
        durationSeconds,
        includeBroll: claim.options.includeBroll,
        transcript,
      });
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);
      try {
        const response =
          input.config.provider === "google"
            ? await request(
                `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
                  input.config.model,
                )}:generateContent`,
                {
                  body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }], role: "user" }],
                    generationConfig: {
                      responseJsonSchema: studioClipsAnalysisJsonSchema,
                      responseMimeType: "application/json",
                      temperature: 0.2,
                    },
                    systemInstruction: {
                      parts: [
                        {
                          text: "You are a grounded short-form video editor. Extract and rank source spans; do not rewrite or invent them.",
                        },
                      ],
                    },
                  }),
                  headers: {
                    "content-type": "application/json",
                    "x-goog-api-key": input.config.apiKey,
                  },
                  method: "POST",
                  redirect: "error",
                  signal: controller.signal,
                },
              )
            : await request("https://api.openai.com/v1/chat/completions", {
                body: JSON.stringify({
                  messages: [
                    {
                      content:
                        "You are a grounded short-form video editor. Extract and rank source spans; do not rewrite or invent them.",
                      role: "system",
                    },
                    { content: prompt, role: "user" },
                  ],
                  model: input.config.model,
                  response_format: {
                    json_schema: {
                      name: "studio_clips_analysis",
                      schema: studioClipsAnalysisJsonSchema,
                      strict: true,
                    },
                    type: "json_schema",
                  },
                  temperature: 0.2,
                }),
                headers: {
                  authorization: `Bearer ${input.config.apiKey}`,
                  "content-type": "application/json",
                },
                method: "POST",
                redirect: "error",
                signal: controller.signal,
              });
        const payload = await readStudioClipsProviderJson(
          response,
          input.config.provider === "google" ? "Google AI" : "OpenAI",
        );
        const text = readStudioClipsModelText(input.config.provider, payload);
        let raw: unknown;
        try {
          raw = JSON.parse(text);
        } catch {
          throw new StudioClipsWorkerError({
            code: "INVALID_ANALYSIS_JSON",
            kind: "permanent",
            publicMessage: "The analysis provider returned invalid clip JSON.",
          });
        }
        return {
          payload: readStudioClipsAnalysisPayload({
            durationSeconds,
            raw,
            transcript,
          }),
          snapshotVersion: 1,
        };
      } catch (error) {
        if (error instanceof StudioClipsWorkerError) throw error;
        throw new StudioClipsWorkerError({
          cause: error,
          code: "ANALYSIS_PROVIDER_UNAVAILABLE",
          kind: "retryable",
          publicMessage: "The clip analysis provider is temporarily unavailable.",
        });
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
