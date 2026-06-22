import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import type { ProductProfileCreateInput } from "@/lib/clipstitchr/types/ProductProfileCreateInput";
import { createProductProfileInputFromProduct } from "@/lib/clipstitchr/utils/createProductProfileInputFromProduct";
import { normalizeProductHookExamples } from "@/lib/clipstitchr/utils/normalizeProductHookExamples";
import { normalizeProductPainPoints } from "@/lib/clipstitchr/utils/normalizeProductPainPoints";
import { normalizeProductProfileOptionalText } from "@/lib/clipstitchr/utils/normalizeProductProfileOptionalText";

export function getProductProfileInputHasChanges({
  input,
  product,
}: {
  input: ProductProfileCreateInput;
  product: ProductProfile;
}) {
  const currentInput = createProductProfileInputFromProduct(product);

  return (
    input.name.trim() !== currentInput.name.trim() ||
    input.productDetails.trim() !== currentInput.productDetails.trim() ||
    input.audienceDetails.trim() !== currentInput.audienceDetails.trim() ||
    normalizeProductProfileOptionalText(input.emotionalNarrative) !==
      normalizeProductProfileOptionalText(currentInput.emotionalNarrative) ||
    normalizeProductProfileOptionalText(input.websiteUrl) !==
      normalizeProductProfileOptionalText(currentInput.websiteUrl) ||
    normalizeProductProfileOptionalText(input.inferredProblem) !==
      normalizeProductProfileOptionalText(currentInput.inferredProblem) ||
    normalizeProductPainPoints(input.inferredPainPoints).join("\n") !==
      normalizeProductPainPoints(currentInput.inferredPainPoints).join("\n") ||
    normalizeProductProfileOptionalText(input.preferredCliprHookStyleKey) !==
      normalizeProductProfileOptionalText(
        currentInput.preferredCliprHookStyleKey,
      ) ||
    normalizeProductHookExamples(input.winningHookExamples).join("\n") !==
      normalizeProductHookExamples(currentInput.winningHookExamples).join("\n") ||
    normalizeProductHookExamples(input.rejectedHookExamples).join("\n") !==
      normalizeProductHookExamples(currentInput.rejectedHookExamples).join(
        "\n",
      ) ||
    normalizeProductProfileOptionalText(input.hookGenerationGoal) !==
      normalizeProductProfileOptionalText(currentInput.hookGenerationGoal) ||
    normalizeProductProfileOptionalText(input.hookEdgeLevel) !==
      normalizeProductProfileOptionalText(currentInput.hookEdgeLevel)
  );
}
