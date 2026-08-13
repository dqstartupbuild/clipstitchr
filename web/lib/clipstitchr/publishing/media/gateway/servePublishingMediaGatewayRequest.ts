import {
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import type { GetObjectCommandOutput } from "@aws-sdk/client-s3";
import type { PublishingMediaGatewayDependencies } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayDependencies";
import { PublishingMediaGatewayRangeError } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayRangeError";
import { PublishingMediaGatewayTokenError } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayTokenError";
import { assertPublishingMediaGatewayR2Response } from "@/lib/clipstitchr/publishing/media/gateway/assertPublishingMediaGatewayR2Response";
import { createPublishingMediaGatewayResponseHeaders } from "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaGatewayResponseHeaders";
import { createPublishingMediaRangeNotSatisfiableResponse } from "@/lib/clipstitchr/publishing/media/gateway/createPublishingMediaRangeNotSatisfiableResponse";
import { isPublishingMediaR2UnavailableError } from "@/lib/clipstitchr/publishing/media/gateway/isPublishingMediaR2UnavailableError";
import { normalizePublishingMediaPublicOrigin } from "@/lib/clipstitchr/publishing/media/gateway/normalizePublishingMediaPublicOrigin";
import { parsePublishingMediaGatewayByteRange } from "@/lib/clipstitchr/publishing/media/gateway/parsePublishingMediaGatewayByteRange";
import { readPublishingMediaGatewayResponseBody } from "@/lib/clipstitchr/publishing/media/gateway/readPublishingMediaGatewayResponseBody";
import { verifyPublishingMediaGatewayToken } from "@/lib/clipstitchr/publishing/media/gateway/verifyPublishingMediaGatewayToken";
import { createRateLimitExceededResponse } from "@/lib/clipstitchr/server/rateLimits/createRateLimitExceededResponse";

export async function servePublishingMediaGatewayRequest(
  request: Request,
  token: string,
  dependencies: PublishingMediaGatewayDependencies,
) {
  const method = request.method.toUpperCase();

  if (method !== "GET" && method !== "HEAD") {
    return Response.json(
      { error: "Method not allowed." },
      {
        status: 405,
        headers: {
          Allow: "GET, HEAD",
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  const publicOrigin = normalizePublishingMediaPublicOrigin(
    dependencies.publicOrigin,
  );

  if (new URL(request.url).origin !== publicOrigin) {
    return Response.json(
      { error: "Publishing media grant is unavailable." },
      { status: 404, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const nowEpochMs = dependencies.nowEpochMs?.() ?? Date.now();
  let claims;

  try {
    claims = verifyPublishingMediaGatewayToken(
      token,
      dependencies.tokenSecret,
      publicOrigin,
      nowEpochMs,
    );
  } catch (error) {
    const status =
      error instanceof PublishingMediaGatewayTokenError &&
      error.code === "expired"
        ? 410
        : 404;

    return Response.json(
      { error: "Publishing media grant is unavailable." },
      { status, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  let range = null;
  let rangeIsInvalid = false;

  try {
    range = parsePublishingMediaGatewayByteRange(
      request.headers.get("range"),
      claims.sizeBytes,
    );
  } catch (error) {
    if (error instanceof PublishingMediaGatewayRangeError) {
      rangeIsInvalid = true;
    } else {
      throw error;
    }
  }

  try {
    await dependencies.rateLimiter.consume({
      grantKey: claims.grantKey,
      quotaIdentity: claims.quotaIdentity,
      readBytes:
        method === "HEAD" || rangeIsInvalid
          ? 0
          : (range?.length ?? claims.sizeBytes),
    });
  } catch (error) {
    const response = createRateLimitExceededResponse(error);

    if (response) {
      response.headers.set("Cache-Control", "private, no-store");
      response.headers.set("X-Content-Type-Options", "nosniff");
      return response;
    }

    return Response.json(
      { error: "Publishing media is temporarily unavailable." },
      {
        status: 503,
        headers: {
          "Cache-Control": "private, no-store",
          "Retry-After": "30",
          "X-Content-Type-Options": "nosniff",
        },
      },
    );
  }

  if (rangeIsInvalid) {
    return createPublishingMediaRangeNotSatisfiableResponse(claims.sizeBytes);
  }

  let r2Response;

  try {
    r2Response = await dependencies.r2Client.send(
      method === "HEAD"
        ? new HeadObjectCommand({
            Bucket: dependencies.bucketName,
            IfMatch: claims.etag,
            Key: claims.objectKey,
            VersionId: claims.versionId,
          })
        : new GetObjectCommand({
            Bucket: dependencies.bucketName,
            IfMatch: claims.etag,
            Key: claims.objectKey,
            Range: range?.requestHeader,
            VersionId: claims.versionId,
          }),
    );
    assertPublishingMediaGatewayR2Response(
      r2Response,
      claims,
      range,
      method,
    );
  } catch (error) {
    const unavailable =
      isPublishingMediaR2UnavailableError(error) ||
      (error instanceof Error &&
        error.message === "Publishing media object identity changed.");

    return Response.json(
      {
        error: unavailable
          ? "Publishing media grant is no longer available."
          : "Publishing media is temporarily unavailable.",
      },
      {
        status: unavailable ? 410 : 502,
        headers: { "Cache-Control": "private, no-store" },
      },
    );
  }

  const headers = createPublishingMediaGatewayResponseHeaders(claims, range);

  if (method === "HEAD") {
    return new Response(null, { headers, status: range ? 206 : 200 });
  }

  let body;

  try {
    body = readPublishingMediaGatewayResponseBody(
      (r2Response as GetObjectCommandOutput).Body,
    );
  } catch {
    return Response.json(
      { error: "Publishing media is temporarily unavailable." },
      { status: 502, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  return new Response(body, { headers, status: range ? 206 : 200 });
}
