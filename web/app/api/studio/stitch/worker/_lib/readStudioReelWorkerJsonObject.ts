import { readStudioStitchBoundedRequestText } from "@/lib/clipstitchr/server/studio/stitch/readStudioStitchBoundedRequestText";

export async function readStudioReelWorkerJsonObject(
  request: Request,
  maxBytes = 64 * 1024,
) {
  const text = await readStudioStitchBoundedRequestText(request, maxBytes);
  if (text.length === 0) {
    throw new Error("The Studio Stitch worker request body is invalid.");
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("The Studio Stitch worker request body must be valid JSON.");
  }
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("The Studio Stitch worker request body must be an object.");
  }
  return value as Record<string, unknown>;
}
