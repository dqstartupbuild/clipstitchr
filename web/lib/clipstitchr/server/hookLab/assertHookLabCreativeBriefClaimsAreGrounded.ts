import type { HookLabCreativeBriefContent } from "@/lib/clipstitchr/types/HookLabCreativeBriefContent";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { findPublicHookClaimSignals } from "@/lib/clipstitchr/tools/publicHooks/findPublicHookClaimSignals";

const measurableClaimPattern =
  /(?:[$€£]\s?\d+(?:[.,]\d+)*|\b\d+(?:\.\d+)?\s?%|\b\d+(?:\.\d+)?\s?(?:days?|downloads?|hours?|installs?|minutes?|months?|seconds?|times?|users?|weeks?|x|years?)\b)/gi;

export function assertHookLabCreativeBriefClaimsAreGrounded({
  brief,
  product,
}: {
  brief: HookLabCreativeBriefContent;
  product: ProductProfile;
}) {
  const productContext = [
    product.productDetails,
    product.audienceDetails,
    product.emotionalNarrative,
    product.inferredProblem,
    ...product.inferredPainPoints,
  ]
    .filter(Boolean)
    .join(" ");
  const supportedKinds = new Set(
    findPublicHookClaimSignals(productContext).map((signal) => signal.kind),
  );
  const briefClaims = [
    brief.hook,
    brief.soundOffOverlay,
    brief.productProof,
    brief.callToAction,
    ...brief.beatScript,
    brief.adaptedCaption,
    brief.adaptedConcept,
    brief.closingCta,
    brief.openingReaction,
    brief.productDemonstration,
    ...(brief.onScreenTextByScene ?? []),
    ...(brief.propsAndInteractions ?? []),
    ...(brief.sceneBySceneDirections ?? []),
    ...(brief.spokenLines ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  const unsupportedSignal = findPublicHookClaimSignals(briefClaims).find(
    (signal) => !supportedKinds.has(signal.kind),
  );
  const unsupportedMeasurement = (
    briefClaims.match(measurableClaimPattern) ?? []
  ).find((measurement) =>
    !productContext.toLocaleLowerCase().includes(measurement.toLocaleLowerCase()),
  );

  if (unsupportedSignal || unsupportedMeasurement) {
    throw new Error(
      `The brief added an unsupported product claim. ${unsupportedSignal?.message ?? "A measurable result needs exact support in the saved product."}`,
    );
  }
}
