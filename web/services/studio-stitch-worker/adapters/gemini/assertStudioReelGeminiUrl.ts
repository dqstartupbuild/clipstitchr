import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function assertStudioReelGeminiUrl(
  value: string,
  kind: "file" | "upload",
) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new StudioReelWorkerError({
      code: "GEMINI_URL_INVALID",
      kind: "permanent",
      publicMessage: "Gemini returned an invalid upload location.",
    });
  }
  const validPath =
    kind === "upload"
      ? url.pathname.startsWith("/upload/")
      : url.pathname.startsWith("/v1beta/files/");
  if (
    url.protocol !== "https:" ||
    url.hostname !== "generativelanguage.googleapis.com" ||
    url.port ||
    url.username ||
    url.password ||
    url.hash ||
    !validPath
  ) {
    throw new StudioReelWorkerError({
      code: "GEMINI_URL_INVALID",
      kind: "permanent",
      publicMessage: "Gemini returned an unsupported upload location.",
    });
  }
  return url.toString();
}
