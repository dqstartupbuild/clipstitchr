export async function requestStudioClipsAssemblyAiWithTimeout(input: {
  fetch: typeof fetch;
  init: RequestInit & { duplex?: "half" };
  timeoutMs: number;
  url: string;
}): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    Math.min(input.timeoutMs, 300_000),
  );
  try {
    return await input.fetch(input.url, {
      ...input.init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
