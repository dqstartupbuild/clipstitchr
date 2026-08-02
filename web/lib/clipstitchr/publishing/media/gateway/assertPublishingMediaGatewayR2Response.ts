import type {
  GetObjectCommandOutput,
  HeadObjectCommandOutput,
} from "@aws-sdk/client-s3";
import type { PublishingMediaGatewayByteRange } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayByteRange";
import type { PublishingMediaGatewayTokenClaims } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayTokenClaims";

export function assertPublishingMediaGatewayR2Response(
  response: GetObjectCommandOutput | HeadObjectCommandOutput,
  claims: PublishingMediaGatewayTokenClaims,
  range: PublishingMediaGatewayByteRange | null,
  method: "GET" | "HEAD",
) {
  const expectedLength =
    method === "HEAD" ? claims.sizeBytes : (range?.length ?? claims.sizeBytes);
  const responseContentType = response.ContentType?.trim().toLowerCase();

  if (
    response.ContentLength !== expectedLength ||
    responseContentType !== claims.contentType ||
    (claims.versionId && response.VersionId !== claims.versionId) ||
    (claims.etag && response.ETag !== claims.etag) ||
    (method === "GET" &&
      range &&
      response.ContentRange !== range.contentRange)
  ) {
    throw new Error("Publishing media object identity changed.");
  }
}
