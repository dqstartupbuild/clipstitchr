export function createAppHookGeneratorRequestGuardResponse(request: Request) {
  const mediaType = request.headers
    .get("content-type")
    ?.split(";", 1)[0]
    ?.trim()
    .toLowerCase();

  if (mediaType !== "application/json") {
    return Response.json(
      { message: "Send this request as JSON." },
      { status: 415 },
    );
  }

  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();
  const origin = request.headers.get("origin");
  const requestOrigin = new URL(request.url).origin;

  if (fetchSite === "cross-site" || (origin && origin !== requestOrigin)) {
    return Response.json(
      { message: "This request is not allowed." },
      { status: 403 },
    );
  }

  return null;
}
