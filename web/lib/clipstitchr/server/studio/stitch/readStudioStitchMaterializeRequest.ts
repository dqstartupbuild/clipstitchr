import { readStudioStitchBoundedJsonBody } from "./readStudioStitchBoundedJsonBody";
import { studioStitchMaterializeRequestSchema } from "./studioStitchMaterializeRequestSchema";

export async function readStudioStitchMaterializeRequest(request: Request) {
  const parsed = studioStitchMaterializeRequestSchema.safeParse(
    await readStudioStitchBoundedJsonBody(request),
  );
  if (!parsed.success) {
    throw new Error(
      `Invalid Studio Stitch materialization: ${parsed.error.issues[0]?.message ?? "invalid input"}.`,
    );
  }
  return parsed.data;
}
