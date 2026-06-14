export async function readStitchScoreRequest(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    stitchId?: unknown;
  } | null;
  const stitchId =
    typeof body?.stitchId === "string" ? body.stitchId.trim() : "";

  if (!stitchId) {
    throw new Error("Choose a stitch to score.");
  }

  return { stitchId };
}
