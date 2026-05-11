import { getJsonFromModelOutput } from "@/lib/clipstitchr/server/getJsonFromModelOutput";
import type { CliprGeneratedScript } from "@/lib/clipstitchr/types/CliprGeneratedScript";

function normalizeString(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function parseCliprGeneratedScript(
  outputText: string,
): CliprGeneratedScript {
  const parsed = JSON.parse(getJsonFromModelOutput(outputText)) as {
    avatarPrompt?: unknown;
    hook?: unknown;
    script?: unknown;
    title?: unknown;
  };
  const hook = normalizeString(parsed.hook, 180);
  const script = normalizeString(parsed.script, 5000);
  const avatarPrompt =
    normalizeString(parsed.avatarPrompt, 500) ||
    "A friendly creator speaks directly to camera in a bright, relevant everyday location with natural expression and soft room tone.";
  const title = normalizeString(parsed.title, 120) || "Clipr engagement clip";

  if (!hook || !script) {
    throw new Error("Clipr script generation returned an incomplete script.");
  }

  return {
    avatarPrompt,
    hook,
    script,
    title,
  };
}
