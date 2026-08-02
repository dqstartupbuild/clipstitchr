export async function readPostBridgeClientErrorMessage(
  response: Response,
  fallback: string,
) {
  const body = (await response.json().catch(() => null)) as {
    error?: string;
    message?: string;
  } | null;

  return body?.message ?? body?.error ?? fallback;
}
