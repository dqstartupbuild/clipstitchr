export async function readR2JsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as { error?: string };

  if (!response.ok) {
    throw new Error(body.error ?? "R2 request failed.");
  }

  return body as T;
}
