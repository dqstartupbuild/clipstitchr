export function createStudioStitchJsonResponse(
  value: unknown,
  init: ResponseInit = {},
) {
  const headers = new Headers(init.headers);
  headers.set("cache-control", "private, no-store");
  return Response.json(value, { ...init, headers });
}
