import { getSocialPublishingProvider } from "@/lib/clipstitchr/social/getSocialPublishingProvider";

export function getPostBridgeLegacyWriteResponse() {
  if (getSocialPublishingProvider() !== "in_house") {
    return null;
  }

  return Response.json(
    {
      error:
        "Post Bridge is read-only while ClipStitchr's direct social publishing is active.",
    },
    { status: 409 },
  );
}
