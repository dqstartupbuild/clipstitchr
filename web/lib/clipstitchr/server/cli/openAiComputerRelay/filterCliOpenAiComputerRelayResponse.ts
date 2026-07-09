import type { CliOpenAiComputerRelayResponse } from "@/lib/clipstitchr/server/cli/openAiComputerRelay/CliOpenAiComputerRelayResponse";

function readResponseId(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("OpenAI response did not include an ID.");
  }

  return value;
}

function readComputerCall(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const raw = value as Record<string, unknown>;

  if (raw.type !== "computer_call") {
    return null;
  }

  if (typeof raw.call_id !== "string" || !Array.isArray(raw.actions)) {
    return null;
  }

  return {
    actions: raw.actions,
    call_id: raw.call_id,
    type: "computer_call",
  };
}

export function filterCliOpenAiComputerRelayResponse(
  value: unknown,
): CliOpenAiComputerRelayResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("OpenAI response was invalid.");
  }

  const raw = value as Record<string, unknown>;
  const output = Array.isArray(raw.output)
    ? raw.output.map(readComputerCall).filter(Boolean)
    : [];

  return {
    id: readResponseId(raw.id),
    output,
  };
}
