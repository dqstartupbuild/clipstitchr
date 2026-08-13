import { readStudioStitchBoundedJsonBody } from "./readStudioStitchBoundedJsonBody";
import { studioStitchRunRequestSchema } from "./studioStitchRunRequestSchema";

export async function readStudioStitchRunRequest(request: Request) {
  const parsed = studioStitchRunRequestSchema.safeParse(
    await readStudioStitchBoundedJsonBody(request),
  );
  if (!parsed.success) {
    throw new Error(
      `Invalid generation request: ${parsed.error.issues[0]?.message ?? "invalid input"}.`,
    );
  }
  if (new Set(parsed.data.recipeIds).size !== parsed.data.recipeIds.length) {
    throw new Error("Generation recipe IDs must be unique.");
  }
  if (parsed.data.reviewCount > parsed.data.recipeIds.length) {
    throw new Error("Review count cannot exceed the recipe count.");
  }

  return parsed.data;
}
