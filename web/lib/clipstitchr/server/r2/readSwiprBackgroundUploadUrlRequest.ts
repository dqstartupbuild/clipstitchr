type SwiprBackgroundUploadUrlRequest = {
  recordId: string;
  contentType: string;
  sizeBytes: number;
};

export async function readSwiprBackgroundUploadUrlRequest(
  request: Request,
): Promise<SwiprBackgroundUploadUrlRequest> {
  const body = (await request.json()) as Partial<SwiprBackgroundUploadUrlRequest>;

  if (!body.recordId || typeof body.recordId !== "string") {
    throw new Error("Missing Swipr background record ID.");
  }

  if (!body.contentType || typeof body.contentType !== "string") {
    throw new Error("Missing Swipr background content type.");
  }

  if (
    typeof body.sizeBytes !== "number" ||
    !Number.isFinite(body.sizeBytes) ||
    body.sizeBytes <= 0
  ) {
    throw new Error("Missing Swipr background upload size.");
  }

  return {
    recordId: body.recordId,
    contentType: body.contentType,
    sizeBytes: Math.ceil(body.sizeBytes),
  };
}
