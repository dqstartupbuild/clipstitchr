import type { AppHookGeneratorInput } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorInput";
import type { AppHookGeneratorResult } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorResult";

export async function generateAppHooks(
  input: AppHookGeneratorInput,
  signal?: AbortSignal,
) {
  const response = await fetch("/api/tools/app-hook-generator", {
    body: JSON.stringify(input),
    headers: { "content-type": "application/json" },
    method: "POST",
    signal,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error(
        "You have made a bunch of hook sets. Give it a minute, then try again.",
      );
    }

    throw new Error(
      [400, 403, 413, 415].includes(response.status)
        ? "Check each field, then try again."
        : "The hook generator is having trouble right now. Try again soon.",
    );
  }

  return (await response.json()) as AppHookGeneratorResult;
}
