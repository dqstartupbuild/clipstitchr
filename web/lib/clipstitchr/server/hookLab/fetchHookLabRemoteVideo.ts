import { fetchHookLabRemoteMedia } from "@/lib/clipstitchr/server/hookLab/fetchHookLabRemoteMedia";
import type { HookLabFetchedVideo } from "@/lib/clipstitchr/types/HookLabFetchedVideo";

type FetchHookLabRemoteVideoOptions = {
  apifyToken?: string;
  fetcher?: typeof fetch;
  maxBytes?: number;
  maxRedirects?: number;
  resolveHostname?: (
    hostname: string,
  ) => Promise<readonly { address: string; family: number }[]>;
  timeoutMs?: number;
  url: string;
};

export function fetchHookLabRemoteVideo({
  apifyToken,
  fetcher,
  maxBytes = 100 * 1024 * 1024,
  maxRedirects = 5,
  resolveHostname,
  timeoutMs = 30_000,
  url,
}: FetchHookLabRemoteVideoOptions): Promise<HookLabFetchedVideo> {
  return fetchHookLabRemoteMedia({
    accept: "video/*",
    apifyToken,
    contentTypePrefix: "video/",
    fetcher,
    maxBytes,
    maxRedirects,
    mediaLabel: "video",
    resolveHostname,
    timeoutMs,
    url,
  });
}
