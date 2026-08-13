import type { HeadObjectCommandOutput } from "@aws-sdk/client-s3";
import type { PublishingMediaObjectIdentity } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaObjectIdentity";

export function readPublishingMediaHeadIdentity(
  head: HeadObjectCommandOutput,
): PublishingMediaObjectIdentity {
  const versionId = head.VersionId?.trim();
  const etag = head.ETag?.trim();
  const sha256 =
    head.ChecksumSHA256?.trim() ||
    head.Metadata?.["checksum-sha256"]?.trim() ||
    head.Metadata?.sha256?.trim();

  return {
    ...(sha256 ? { checksum: `sha256:${sha256}` } : {}),
    ...(etag ? { etag } : {}),
    ...(versionId ? { versionId } : {}),
  };
}
