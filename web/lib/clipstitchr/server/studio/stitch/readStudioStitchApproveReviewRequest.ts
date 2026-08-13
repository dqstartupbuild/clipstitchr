import { readStudioStitchBoundedJsonBody } from "./readStudioStitchBoundedJsonBody";
import { studioStitchApproveReviewRequestSchema } from "./studioStitchApproveReviewRequestSchema";

export async function readStudioStitchApproveReviewRequest(request: Request) {
  const parsed = studioStitchApproveReviewRequestSchema.safeParse(
    await readStudioStitchBoundedJsonBody(request),
  );
  if (!parsed.success) {
    throw new Error(
      `Invalid review approval: ${parsed.error.issues[0]?.message ?? "invalid input"}.`,
    );
  }
  if (
    new Set(parsed.data.approvedOutputIds).size !==
    parsed.data.approvedOutputIds.length
  ) {
    throw new Error("Approved output IDs must be unique.");
  }

  return parsed.data;
}
