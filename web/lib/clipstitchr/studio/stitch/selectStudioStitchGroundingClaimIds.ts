import type { StudioStitchProductGrounding } from "../../types/studioStitch/StudioStitchProductGrounding";

type StudioStitchGroundingPurpose = "hook" | "supporting" | "cta" | "voice";

export function selectStudioStitchGroundingClaimIds(
  grounding: StudioStitchProductGrounding,
  purpose: StudioStitchGroundingPurpose,
): string[] {
  if (purpose === "voice") {
    return grounding.claims.map((claim) => claim.id);
  }
  const preferredIds =
    purpose === "hook"
      ? [
          "claim_inferred_problem",
          "claim_inferred_pain_point_1",
          "claim_product_proof",
          "claim_product_details",
        ]
      : purpose === "supporting"
        ? [
            "claim_product_proof",
            "claim_product_details",
            "claim_audience_details",
          ]
        : ["claim_product_name", "claim_product_proof"];
  const available = new Set(grounding.claims.map((claim) => claim.id));
  return preferredIds.filter((id) => available.has(id)).slice(0, 2);
}
