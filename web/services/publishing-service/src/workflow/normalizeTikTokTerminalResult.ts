import type { ProviderPublishResult } from "../provider-runtime/contracts/ProviderPublishResult.js";

export const normalizeTikTokTerminalResult = (
  result: ProviderPublishResult,
): ProviderPublishResult =>
  result.kind === "published_not_public"
    ? Object.freeze({
        ...result,
        kind: "published" as const,
      })
    : result;
