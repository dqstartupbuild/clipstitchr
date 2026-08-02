export function createPublishingMediaRangeNotSatisfiableResponse(
  sizeBytes: number,
) {
  return Response.json(
    { error: "The requested byte range is not available." },
    {
      status: 416,
      headers: {
        "Accept-Ranges": "bytes",
        "Cache-Control": "private, no-store, max-age=0",
        "Content-Range": `bytes */${sizeBytes}`,
        "X-Content-Type-Options": "nosniff",
      },
    },
  );
}
