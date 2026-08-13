import type { HookLabCreativeBriefContent } from "../../types/HookLabCreativeBriefContent";
import type { ProductProfile } from "../../types/ProductProfile";
import type { StudioStitchGroundingClaim } from "../../types/studioStitch/StudioStitchGroundingClaim";
import type { StudioStitchProductGrounding } from "../../types/studioStitch/StudioStitchProductGrounding";
import { addStudioStitchProductClaim } from "./addStudioStitchProductClaim";
import { normalizeStudioStitchText } from "./normalizeStudioStitchText";

export function createStudioStitchProductGrounding(
  product: ProductProfile,
  creativeBrief: HookLabCreativeBriefContent,
): StudioStitchProductGrounding {
  const productId = normalizeStudioStitchText(product.id, "Product ID", 240);
  const productName = normalizeStudioStitchText(
    product.name,
    "Product name",
    500,
  );
  const claims: StudioStitchGroundingClaim[] = [];
  const addProductClaim = addStudioStitchProductClaim.bind(null, claims);
  addProductClaim("claim_product_name", productName, "name");
  addProductClaim(
    "claim_product_details",
    product.productDetails,
    "productDetails",
  );
  addProductClaim(
    "claim_audience_details",
    product.audienceDetails,
    "audienceDetails",
  );
  addProductClaim(
    "claim_emotional_narrative",
    product.emotionalNarrative,
    "emotionalNarrative",
  );
  addProductClaim(
    "claim_inferred_problem",
    product.inferredProblem,
    "inferredProblem",
  );
  if (!Array.isArray(product.inferredPainPoints)) {
    throw new Error("Product inferred pain points must be an array.");
  }
  product.inferredPainPoints.forEach((painPoint, index) => {
    if (typeof painPoint === "string" && painPoint.trim().length > 0) {
      claims.push({
        id: `claim_inferred_pain_point_${index + 1}`,
        text: normalizeStudioStitchText(
          painPoint,
          `Inferred pain point ${index + 1}`,
          2_000,
        ),
        source: {
          kind: "productProfile",
          field: "inferredPainPoints",
          sourceIndex: index,
        },
      });
    }
  });
  claims.push({
    id: "claim_product_proof",
    text: normalizeStudioStitchText(
      creativeBrief.productProof,
      "Hook Lab product proof",
      4_000,
    ),
    source: {
      kind: "hookLabCreativeBrief",
      field: "productProof",
      sourceIndex: null,
    },
  });
  return { productId, productName, claims };
}
