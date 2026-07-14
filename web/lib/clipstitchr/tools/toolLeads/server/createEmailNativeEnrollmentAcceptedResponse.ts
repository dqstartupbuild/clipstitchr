export function createEmailNativeEnrollmentAcceptedResponse() {
  return Response.json(
    { accepted: true },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
