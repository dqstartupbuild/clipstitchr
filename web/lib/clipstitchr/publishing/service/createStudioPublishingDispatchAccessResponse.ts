export function createStudioPublishingDispatchAccessResponse(
  allowed: boolean,
  status = 200,
) {
  return Response.json(
    { allowed },
    {
      headers: { "cache-control": "private, no-store" },
      status,
    },
  );
}
