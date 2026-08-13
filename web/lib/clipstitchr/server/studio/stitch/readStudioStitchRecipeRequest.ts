import { readStudioStitchBoundedJsonBody } from "./readStudioStitchBoundedJsonBody";
import { studioStitchRecipeRequestSchema } from "./studioStitchRecipeRequestSchema";

export async function readStudioStitchRecipeRequest(request: Request) {
  const parsed = studioStitchRecipeRequestSchema.safeParse(
    await readStudioStitchBoundedJsonBody(request),
  );
  if (!parsed.success) {
    throw new Error(
      `Invalid Studio Stitch recipe request: ${parsed.error.issues[0]?.message ?? "invalid input"}.`,
    );
  }

  return parsed.data;
}
