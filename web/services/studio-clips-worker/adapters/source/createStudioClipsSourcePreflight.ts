import type { StudioClipsPipelineAdapter } from "../../contracts/StudioClipsPipelineAdapter";
import { assertStudioClipsOwnedObjectKey } from "../../security/assertStudioClipsOwnedObjectKey";

export function createStudioClipsSourcePreflight(): StudioClipsPipelineAdapter["preflightSource"] {
  return async ({ claim, youtubePolicy }) => {
    if (claim.source.kind === "youtube") {
      youtubePolicy.readUrl(claim.source.url);
      return {};
    }
    assertStudioClipsOwnedObjectKey(claim.ownerId, claim.source.objectKey);
    return {
      contentType: claim.source.contentType,
      estimatedSizeBytes: claim.source.sizeBytes,
    };
  };
}
