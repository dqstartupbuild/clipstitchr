import { readStudioStitchBoundedJsonBody } from "./readStudioStitchBoundedJsonBody";
import { studioStitchRevisionRequestSchema } from "./studioStitchRevisionRequestSchema";

export async function readStudioStitchRevisionRequest(request: Request) {
  const parsed = studioStitchRevisionRequestSchema.safeParse(
    await readStudioStitchBoundedJsonBody(request),
  );
  if (!parsed.success) {
    throw new Error(
      `Invalid lifecycle request: ${parsed.error.issues[0]?.message ?? "invalid input"}.`,
    );
  }

  return parsed.data;
}
