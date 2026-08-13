import { readStudioStitchBoundedJsonBody } from "./readStudioStitchBoundedJsonBody";
import { studioStitchRemainingRequestSchema } from "./studioStitchRemainingRequestSchema";

export async function readStudioStitchRemainingRequest(request: Request) {
  const parsed = studioStitchRemainingRequestSchema.safeParse(
    await readStudioStitchBoundedJsonBody(request),
  );
  if (!parsed.success) {
    throw new Error(
      `Invalid remaining-batch request: ${parsed.error.issues[0]?.message ?? "invalid input"}.`,
    );
  }

  return parsed.data;
}
