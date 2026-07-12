export async function fetchApifyJson(
  url: string,
  init: RequestInit,
  fetcher: typeof fetch = fetch,
  timeoutMs = 30000,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetcher(url, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Apify could not complete the request.");
    }

    return (await response.json()) as unknown;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Apify took too long to respond.");
    }

    throw new Error("Apify could not complete the request.");
  } finally {
    clearTimeout(timeout);
  }
}
