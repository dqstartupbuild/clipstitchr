export async function waitForPostBridgeRetry(response: Response, attempt: number) {
  const retryAfterHeader = response.headers.get("retry-after");
  const retryAfterSeconds = retryAfterHeader
    ? Number.parseFloat(retryAfterHeader)
    : Number.NaN;
  const delayMs = Number.isFinite(retryAfterSeconds)
    ? retryAfterSeconds * 1000
    : 350 * 2 ** attempt;

  await new Promise((resolve) => setTimeout(resolve, Math.min(delayMs, 5000)));
}
