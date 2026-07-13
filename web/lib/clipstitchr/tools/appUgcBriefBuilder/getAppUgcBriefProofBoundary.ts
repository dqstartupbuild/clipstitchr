export function getAppUgcBriefProofBoundary(proofPoint: string) {
  const normalizedProof = proofPoint.trim();

  return normalizedProof
    ? `Approved proof: ${normalizedProof}. Use only this wording or a weaker paraphrase. Do not add numbers, guarantees, testimonials, rankings, or personal experience.`
    : "No approved proof was supplied. Do not invent numbers, guarantees, testimonials, rankings, savings, speed, or personal experience.";
}
