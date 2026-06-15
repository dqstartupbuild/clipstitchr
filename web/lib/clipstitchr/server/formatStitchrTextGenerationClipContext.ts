import type { StitchrTextGenerationClipContext } from "@/lib/clipstitchr/types/StitchrTextGenerationClipContext";

export function formatStitchrTextGenerationClipContext(
  context: StitchrTextGenerationClipContext,
) {
  const details = [
    context.videoDescription ? `video: ${context.videoDescription}` : "",
    context.mainPersonDescription
      ? `person: ${context.mainPersonDescription}`
      : "",
    context.poseDescription ? `pose: ${context.poseDescription}` : "",
    context.outfitDescription ? `outfit: ${context.outfitDescription}` : "",
    context.locationDescription
      ? `location: ${context.locationDescription}`
      : "",
    context.productDescription
      ? `product shown: ${context.productDescription}`
      : "",
    context.quickEditOverlayTextHint
      ? `AI hook hint: ${context.quickEditOverlayTextHint}`
      : "",
    context.quickEditOverlayTextReason
      ? `AI hook hint reason: ${context.quickEditOverlayTextReason}`
      : "",
    context.tags?.length ? `tags: ${context.tags.join(", ")}` : "",
  ].filter(Boolean);

  return [
    `${context.role.toUpperCase()} clip: ${context.name}`,
    context.libraryKind ? `library kind: ${context.libraryKind}` : "",
    details.length ? `observed context: ${details.join("; ")}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
}
