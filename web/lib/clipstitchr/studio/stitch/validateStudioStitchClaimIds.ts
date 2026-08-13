import type { StudioStitchValidationIssue } from "../../types/studioStitch/StudioStitchValidationIssue";
import { addStudioStitchValidationIssue } from "./addStudioStitchValidationIssue";

export function validateStudioStitchClaimIds(
  issues: StudioStitchValidationIssue[],
  candidate: unknown,
  path: string,
  claimIds: ReadonlySet<string>,
): void {
  if (!Array.isArray(candidate)) {
    addStudioStitchValidationIssue(
      issues,
      path,
      "invalid_claim_refs",
      "Expected a claim ID array.",
    );
    return;
  }
  const seen = new Set<string>();
  candidate.forEach((claimId, index) => {
    if (
      typeof claimId !== "string" ||
      !claimIds.has(claimId) ||
      seen.has(claimId)
    ) {
      addStudioStitchValidationIssue(
        issues,
        `${path}[${index}]`,
        "invalid_claim_ref",
        "Grounding claim references must exist and be unique.",
      );
    } else {
      seen.add(claimId);
    }
  });
}
