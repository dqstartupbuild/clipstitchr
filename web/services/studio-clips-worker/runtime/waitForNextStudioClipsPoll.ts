import { setTimeout as wait } from "node:timers/promises";

export async function waitForNextStudioClipsPoll(
  milliseconds: number,
  signal: AbortSignal,
): Promise<void> {
  if (signal.aborted) return;
  try {
    await wait(milliseconds, undefined, { signal });
  } catch (error) {
    if (!signal.aborted) throw error;
  }
}
