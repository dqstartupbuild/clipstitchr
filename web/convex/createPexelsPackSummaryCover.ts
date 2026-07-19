import type { Doc } from "./_generated/dataModel";

export function createPexelsPackSummaryCover(
  background: Pick<Doc<"swiprBackgroundCards">, "id" | "imageObject">,
) {
  return {
    backgroundId: background.id,
    imageObject: background.imageObject,
  };
}
