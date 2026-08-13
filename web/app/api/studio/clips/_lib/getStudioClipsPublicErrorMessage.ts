import { studioClipsPublicErrorMessages } from "./studioClipsPublicErrorMessages";

export function getStudioClipsPublicErrorMessage(
  error: unknown,
  fallback: string,
) {
  if (!(error instanceof Error)) return fallback;
  const firstLine = error.message.split("\n", 1)[0] ?? "";
  const message = firstLine
    .replace(/^.*?Uncaught Error:\s*/i, "")
    .replace(/^Server Error\s*/i, "")
    .trim();
  if (!studioClipsPublicErrorMessages.has(message)) {
    return fallback;
  }
  return message;
}
