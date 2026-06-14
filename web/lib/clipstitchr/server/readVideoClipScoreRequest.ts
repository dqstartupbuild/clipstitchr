export async function readVideoClipScoreRequest(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    clipId?: unknown;
  } | null;
  const clipId = typeof body?.clipId === "string" ? body.clipId.trim() : "";

  if (!clipId) {
    throw new Error("Choose a clip to score.");
  }

  return { clipId };
}
