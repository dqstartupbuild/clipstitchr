export function createPublicToolInteractionAcceptedResponse() {
  return Response.json(
    { accepted: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
