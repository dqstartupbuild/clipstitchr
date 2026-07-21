import { createHookLabRemoteMediaRequestHeaders } from "@/lib/clipstitchr/server/hookLab/createHookLabRemoteMediaRequestHeaders";

export function createHookLabRemoteVideoRequestHeaders(
  url: URL,
  apifyToken?: string,
) {
  return createHookLabRemoteMediaRequestHeaders(url, "video/*", apifyToken);
}
