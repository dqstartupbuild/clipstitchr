export function createStudioBetaR2JsonResponse(
  body: unknown,
  status = 200,
) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}
