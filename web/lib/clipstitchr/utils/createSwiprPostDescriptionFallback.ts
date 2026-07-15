import {
  SWIPR_POST_DESCRIPTION_MAX_LENGTH,
} from "@/lib/clipstitchr/constants/swiprPostDescriptionLengthBounds";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

export function createSwiprPostDescriptionFallback({
  caption,
  product,
  slides,
}: {
  caption: string;
  product: ProductProfile;
  slides: string[];
}) {
  const cleanSlides = slides
    .map((slide) => slide.trim().replace(/\s+/g, " "))
    .filter(Boolean);
  const cleanCaption = caption.trim().replace(/\s+/g, " ");
  const audience = product.audienceDetails?.trim();
  const problem =
    product.inferredProblem?.trim() ||
    product.inferredPainPoints[0]?.trim();
  const opening =
    cleanCaption ||
    cleanSlides[0] ||
    `A practical note from ${product.name}.`;
  const supportingPoints = cleanSlides
    .filter((slide) => slide.toLowerCase() !== opening.toLowerCase())
    .map((slide) => `- ${slide}`)
    .join("\n");
  const paragraphs = [
    opening,
    audience && problem
      ? `For ${audience}: ${problem.replace(/[.!?]+$/g, "")}.`
      : audience
        ? `For ${audience}.`
        : problem
          ? problem
          : "",
    supportingPoints,
  ].filter(Boolean);

  return paragraphs
    .join("\n\n")
    .slice(0, SWIPR_POST_DESCRIPTION_MAX_LENGTH)
    .trim();
}
