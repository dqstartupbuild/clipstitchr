import type {
  CliOpenAiComputerRelayRequest,
  CliOpenAiComputerRelayScreenshotInput,
} from "@/lib/clipstitchr/server/cli/openAiComputerRelay/CliOpenAiComputerRelayRequest";
import { cliOpenAiComputerRelayMaxCallsPerRun } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/cliOpenAiComputerRelayMaxCallsPerRun";
import { cliOpenAiComputerRelayMaxInputTextLength } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/cliOpenAiComputerRelayMaxInputTextLength";
import { cliOpenAiComputerRelayMaxRunDurationMs } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/cliOpenAiComputerRelayMaxRunDurationMs";
import { cliOpenAiComputerRelayMaxScreenshotBase64Length } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/cliOpenAiComputerRelayMaxScreenshotBase64Length";
import { readCliRequiredString } from "@/lib/clipstitchr/server/cli/readCliRequiredString";

const screenshotDataUrlPrefix = "data:image/png;base64,";

function readOptionalString(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim()
    ? value.trim().slice(0, maxLength)
    : undefined;
}

function readModel(value: unknown) {
  const model = readOptionalString(value, 80);

  if (!model || !/^[a-zA-Z0-9._:-]+$/.test(model)) {
    throw new Error("OpenAI model is invalid.");
  }

  return model;
}

function readRunStartedAt(value: unknown) {
  const runStartedAt = readOptionalString(value, 80);
  const startedAtMs = runStartedAt ? Date.parse(runStartedAt) : Number.NaN;

  if (!Number.isFinite(startedAtMs)) {
    throw new Error("Relay run start time is invalid.");
  }

  if (Date.now() - startedAtMs > cliOpenAiComputerRelayMaxRunDurationMs) {
    throw new Error("OpenAI Computer Use relay runs are limited to 20 minutes.");
  }

  if (startedAtMs - Date.now() > 60_000) {
    throw new Error("Relay run start time is in the future.");
  }

  return new Date(startedAtMs).toISOString();
}

function readCallIndex(value: unknown): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new Error("Relay call index is invalid.");
  }

  if (value > cliOpenAiComputerRelayMaxCallsPerRun) {
    throw new Error(
      `OpenAI Computer Use relay runs are limited to ${cliOpenAiComputerRelayMaxCallsPerRun} calls.`,
    );
  }

  return value;
}

function readBase64ScreenshotDataUrl(value: unknown) {
  const imageUrl = readOptionalString(
    value,
    screenshotDataUrlPrefix.length +
      cliOpenAiComputerRelayMaxScreenshotBase64Length,
  );

  if (!imageUrl?.startsWith(screenshotDataUrlPrefix)) {
    throw new Error("Relay screenshots must be PNG data URLs.");
  }

  const base64 = imageUrl.slice(screenshotDataUrlPrefix.length);

  if (base64.length > cliOpenAiComputerRelayMaxScreenshotBase64Length) {
    throw new Error("Relay screenshot is too large.");
  }

  if (!/^[A-Za-z0-9+/=]+$/.test(base64)) {
    throw new Error("Relay screenshot is not valid base64.");
  }

  return `${screenshotDataUrlPrefix}${base64}`;
}

function readScreenshotInput(value: unknown): CliOpenAiComputerRelayScreenshotInput {
  if (!Array.isArray(value) || value.length !== 1) {
    throw new Error("Relay screenshot input must contain one item.");
  }

  const item = value[0];

  if (!item || typeof item !== "object" || Array.isArray(item)) {
    throw new Error("Relay screenshot input is invalid.");
  }

  const raw = item as Record<string, unknown>;
  const output = raw.output;

  if (!output || typeof output !== "object" || Array.isArray(output)) {
    throw new Error("Relay screenshot output is invalid.");
  }

  const rawOutput = output as Record<string, unknown>;

  if (raw.type !== "computer_call_output") {
    throw new Error("Relay screenshot input type is invalid.");
  }

  if (rawOutput.type !== "computer_screenshot") {
    throw new Error("Relay screenshot output type is invalid.");
  }

  if (rawOutput.detail !== "original") {
    throw new Error("Relay screenshots must use original detail.");
  }

  return [
    {
      call_id: readCliRequiredString(raw, "call_id", "computer call ID").slice(
        0,
        200,
      ),
      output: {
        detail: "original",
        image_url: readBase64ScreenshotDataUrl(rawOutput.image_url),
        type: "computer_screenshot",
      },
      type: "computer_call_output",
    },
  ];
}

function readInput(value: unknown): CliOpenAiComputerRelayRequest["input"] {
  if (typeof value === "string") {
    const input = value.trim();

    if (!input) {
      throw new Error("Relay input is required.");
    }

    if (input.length > cliOpenAiComputerRelayMaxInputTextLength) {
      throw new Error("Relay task input is too long.");
    }

    return input;
  }

  return readScreenshotInput(value);
}

export function readCliOpenAiComputerRelayRequest(
  body: Record<string, unknown>,
): CliOpenAiComputerRelayRequest {
  return {
    callIndex: readCallIndex(body.callIndex),
    input: readInput(body.input),
    model: readModel(body.model),
    previousResponseId: readOptionalString(body.previousResponseId, 200),
    runId: readCliRequiredString(body, "runId", "run ID").slice(0, 120),
    runStartedAt: readRunStartedAt(body.runStartedAt),
  };
}
