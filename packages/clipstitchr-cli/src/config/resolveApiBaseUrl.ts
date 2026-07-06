import type { ClipstitchrConfig } from "./ClipstitchrConfig.js";
import { defaultApiBaseUrl } from "./defaultApiBaseUrl.js";

export function resolveApiBaseUrl(config: ClipstitchrConfig, api?: string) {
  return (
    api ??
    process.env.CLIPSTITCHR_API_URL ??
    config.apiBaseUrl ??
    defaultApiBaseUrl
  ).replace(/\/$/, "");
}
