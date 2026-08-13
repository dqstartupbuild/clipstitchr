export function createStudioLazyReelJsonResponse(
  body: unknown,
  init?: ResponseInit,
): Response {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store");
  return Response.json(body, { ...init, headers });
}
