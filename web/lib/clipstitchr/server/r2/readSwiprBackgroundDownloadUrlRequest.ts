type SwiprBackgroundDownloadUrlRequest = {
  id: string;
};

export async function readSwiprBackgroundDownloadUrlRequest(
  request: Request,
): Promise<SwiprBackgroundDownloadUrlRequest> {
  const body = (await request.json()) as Partial<SwiprBackgroundDownloadUrlRequest>;

  if (!body.id || typeof body.id !== "string") {
    throw new Error("Missing Swipr background ID.");
  }

  return {
    id: body.id,
  };
}
