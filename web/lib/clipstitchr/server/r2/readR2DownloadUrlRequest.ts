type R2DownloadUrlRequest = {
  key: string;
};

export async function readR2DownloadUrlRequest(
  request: Request,
): Promise<R2DownloadUrlRequest> {
  const body = (await request.json()) as Partial<R2DownloadUrlRequest>;

  if (!body.key || typeof body.key !== "string") {
    throw new Error("Missing R2 object key.");
  }

  return {
    key: body.key,
  };
}
