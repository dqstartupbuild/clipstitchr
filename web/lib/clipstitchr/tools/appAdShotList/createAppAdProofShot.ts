import type { AppAdShot } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShot";
import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";

export function createAppAdProofShot(
  input: AppAdShotListInput,
): AppAdShot | null {
  const proof = input.proofPoint.trim();

  if (!proof) {
    return null;
  }

  return {
    action: `Capture only the visible support for this approved proof: ${proof}`,
    audioDirection:
      "Use the approved wording. Do not add numbers, rankings, guarantees, endorsements, or personal experience.",
    duration: "2–6 seconds",
    framing:
      "Frame the approved evidence clearly enough to understand at phone size.",
    group: "proof",
    handoff:
      "Keep the evidence separate and retain the source approval that supports its use.",
    id: "PROOF-01",
    purpose:
      "Give the editor optional support without inventing or strengthening a claim.",
    source: "b-roll",
    title: "Approved proof",
  };
}
