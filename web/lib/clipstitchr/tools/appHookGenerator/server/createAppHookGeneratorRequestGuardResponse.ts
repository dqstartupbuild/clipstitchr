import { createPublicApiErrorResponse } from "@/lib/clipstitchr/publicApi/createPublicApiErrorResponse";

export function createAppHookGeneratorRequestGuardResponse(request: Request) {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  if (mediaType !== "application/json") {
    return createPublicApiErrorResponse({
      code: "unsupported_media_type",
      message: "Send this request as JSON.",
      resolution: "Set Content-Type to application/json and send a JSON object.",
      status: 415,
    });
  }

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;

  if (fetchSite === "cross-site" || (origin && origin !== requestOrigin)) {
    return createPublicApiErrorResponse({
      code: "origin_not_allowed",
      message: "This request is not allowed.",
      resolution:
        "Call this public endpoint from the same origin or from a server without browser origin headers.",
      status: 403,
    });
  }

  return null;
}
