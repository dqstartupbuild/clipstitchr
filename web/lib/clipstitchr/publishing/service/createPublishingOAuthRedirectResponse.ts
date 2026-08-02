import { readPublishingWebOrigin } from "@/lib/clipstitchr/publishing/service/readPublishingWebOrigin";

export function createPublishingOAuthRedirectResponse(
  outcome: "cancelled" | "connected" | "failed",
): Response {
  const destination = new URL(
    "/dashboard/publishing/integrations",
    readPublishingWebOrigin(),
  );
  destination.searchParams.set("connection", outcome);

  return new Response(null, {
    status: 303,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      Location: destination.toString(),
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
