export async function getJsonResponse<T>(response: Response): Promise<T> {
  const body = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;

  if (!response.ok || !body) {
    throw new Error(body?.message ?? "The request could not be completed.");
  }

  return body;
}
