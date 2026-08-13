import { readStudioStitchBoundedJsonBody } from "./readStudioStitchBoundedJsonBody";
import { studioStitchAcceptOutputRequestSchema } from "./studioStitchAcceptOutputRequestSchema";

export async function readStudioStitchAcceptOutputRequest(request: Request) {
  const parsed = studioStitchAcceptOutputRequestSchema.safeParse(
    await readStudioStitchBoundedJsonBody(request),
  );
  if (!parsed.success) {
    throw new Error(
      `Invalid output acceptance: ${parsed.error.issues[0]?.message ?? "invalid input"}.`,
    );
  }

  return parsed.data;
}
