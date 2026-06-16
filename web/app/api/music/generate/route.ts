export async function POST(_request?: Request) {
  void _request;

  return Response.json(
    {
      message: "Music generation has been removed. Upload a music file instead.",
    },
    { status: 410 },
  );
}
