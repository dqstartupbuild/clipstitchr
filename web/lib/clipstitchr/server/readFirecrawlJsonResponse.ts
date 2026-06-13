export async function readFirecrawlJsonResponse<T>(response: Response) {
  return (await response.json().catch(() => null)) as T | null;
}
