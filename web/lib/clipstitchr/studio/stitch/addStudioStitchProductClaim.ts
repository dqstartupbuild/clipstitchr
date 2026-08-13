import type { StudioStitchGroundingClaim } from "../../types/studioStitch/StudioStitchGroundingClaim";
import { normalizeStudioStitchText } from "./normalizeStudioStitchText";

export function addStudioStitchProductClaim(
  claims: StudioStitchGroundingClaim[],
  id: string,
  text: string | undefined,
  field:
    | "name"
    | "productDetails"
    | "audienceDetails"
    | "emotionalNarrative"
    | "inferredProblem",
): void {
  if (typeof text === "string" && text.trim().length > 0) {
    claims.push({
      id,
      text: normalizeStudioStitchText(text, field, 4_000),
      source: { kind: "productProfile", field, sourceIndex: null },
    });
  }
}
