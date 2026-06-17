import {
  SWIPR_POST_DESCRIPTION_MAX_LENGTH,
  SWIPR_POST_DESCRIPTION_MIN_LENGTH,
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
  const audience = product.audienceDetails?.trim() || "anyone this hits for";
  const problem =
    product.inferredProblem?.trim() ||
    product.inferredPainPoints[0]?.trim() ||
    "the part that keeps feeling harder than it should";
  const opening =
    cleanCaption ||
    cleanSlides[0] ||
    "This is the small shift worth paying attention to.";
  const slideSummary = cleanSlides.length
    ? `The carousel walks through this idea in order: ${cleanSlides.join(" ")}`
    : "";
  const paragraphs = [
    opening,
    `This is for ${audience}. It is about ${problem.replace(/[.!?]+$/g, "")}, and the way that small friction can quietly turn into the whole routine.`,
    slideSummary,
    `The point is not to make everything bigger or more complicated. It is to notice the moment where the work starts to feel scattered, name it clearly, and choose one easier next step before the problem gets heavier than it needs to be.`,
    `${product.name} is part of that context. Use this as a reminder to make the next move feel simple enough that you can actually repeat it.`,
  ].filter(Boolean);
  const expansion = [
    "If this made you pause, save it for the next time you are trying to make a decision with too many loose pieces in your head.",
    "The useful move is usually smaller than the dramatic one: write down the next step, remove one extra decision, and make the path easy to follow.",
    "That is what makes the idea practical. It gives you something you can come back to when the day gets busy and the obvious next move starts to blur.",
    "Share it with someone who keeps trying to do the whole thing from memory, because the simplest system is often the one that finally gets used.",
  ];
  let description = paragraphs.join("\n\n");
  let expansionIndex = 0;

  while (description.length < SWIPR_POST_DESCRIPTION_MIN_LENGTH) {
    description = `${description}\n\n${expansion[expansionIndex % expansion.length]}`;
    expansionIndex += 1;
  }

  return description.slice(0, SWIPR_POST_DESCRIPTION_MAX_LENGTH).trim();
}
