type PublicApiErrorResponseOptions = {
  code: string;
  message: string;
  resolution: string;
  retryAfter?: string;
  status: number;
};

export function createPublicApiErrorResponse({
  code,
  message,
  resolution,
  retryAfter,
  status,
}: PublicApiErrorResponseOptions) {
  return Response.json(
    { error: { code, message, resolution } },
    {
      headers: {
        ...(retryAfter ? { "Retry-After": retryAfter } : {}),
        "Cache-Control": "no-store",
      },
      status,
    },
  );
}
