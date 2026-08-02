import { assertPublishingPersistenceIdentifier } from "./assertPublishingPersistenceIdentifier.js";

export const createDurableMediaPath = (mediaSourceId: string): string => {
  assertPublishingPersistenceIdentifier(mediaSourceId, "mediaSourceId");
  return `clipstitchr-media-source:${mediaSourceId}`;
};
