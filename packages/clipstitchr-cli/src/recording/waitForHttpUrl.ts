import { waitForMilliseconds } from "../utils/waitForMilliseconds.js";

export async function waitForHttpUrl(url: string, timeoutMs = 60_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { method: "GET" });

      if (response.ok || response.status < 500) {
        return;
      }
    } catch {
      await waitForMilliseconds(1000);
    }
  }

  throw new Error(`Could not open ${url}. Check the start command and URL.`);
}
