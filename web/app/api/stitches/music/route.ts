export async function POST(_request?: Request) {
  void _request;

  return Response.json(
    {
      message:
        "Stitch music generation has been removed. Upload a music file instead.",
    },
    { status: 410 },
  );
}
