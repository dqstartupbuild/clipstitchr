import { readStudioStitchBoundedRequestText } from "./readStudioStitchBoundedRequestText";

export async function readStudioStitchBoundedJsonBody(request: Request) {
  const text = await readStudioStitchBoundedRequestText(request, 512 * 1024);
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Studio Stitch request must be valid JSON.");
  }
}
