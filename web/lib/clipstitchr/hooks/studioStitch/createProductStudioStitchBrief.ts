import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createProductStudioStitchBrief(
  product: ProductProfile,
): HookLabCreativeBriefContent {
  const problem = product.inferredProblem?.trim() || product.productDetails;
  const painPoint = product.inferredPainPoints.find((item) => item.trim());
  const proof = product.productDetails.trim();

  return {
    beatScript: [problem, proof, product.emotionalNarrative ?? product.name],
    callToAction: `See what ${product.name} can do for you.`,
    closingCta: `Try ${product.name}.`,
    directionName: `${product.name} proof first`,
    footageNeeds: ["A genuine reaction", "A clear product demonstration"],
    hook: painPoint
      ? `If ${painPoint.toLowerCase()} feels familiar, watch this.`
      : `Watch ${product.name} turn the problem into visible proof.`,
    openingVisual: "Open on the result, then show how the Product creates it.",
    productProof: proof,
    soundOffOverlay: `${product.name}, shown in action`,
    spokenLines: [problem, proof, `Try ${product.name}.`],
  };
}
