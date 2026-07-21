import { fetchHookLabRemoteMedia } from "@/lib/clipstitchr/server/hookLab/fetchHookLabRemoteMedia";
import type { HookLabFetchedMedia } from "@/lib/clipstitchr/types/HookLabFetchedMedia";

type FetchHookLabRemoteImageOptions = {
  apifyToken?: string;
  fetcher?: typeof fetch;
  maxBytes?: number;
  resolveHostname?: (
    hostname: string,
  ) => Promise<readonly { address: string; family: number }[]>;
  timeoutMs?: number;
  url: string;
};

export function fetchHookLabRemoteImage({
  apifyToken,
  fetcher,
  maxBytes = 10 * 1024 * 1024,
  resolveHostname,
  timeoutMs = 30_000,
  url,
}: FetchHookLabRemoteImageOptions): Promise<HookLabFetchedMedia> {
  return fetchHookLabRemoteMedia({
    accept: "image/*",
    apifyToken,
    contentTypePrefix: "image/",
    fetcher,
    maxBytes,
    maxRedirects: 5,
    mediaLabel: "image",
    resolveHostname,
    timeoutMs,
    url,
  });
}
