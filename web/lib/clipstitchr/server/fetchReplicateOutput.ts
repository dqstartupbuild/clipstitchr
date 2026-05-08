import { getReplicateToken } from "@/lib/clipstitchr/server/getReplicateToken";
import { getSafeReplicateOutputUrl } from "@/lib/clipstitchr/server/getSafeReplicateOutputUrl";

export async function fetchReplicateOutput(
  rawUrl: string,
  requestToken?: string | null,
) {
  const outputUrl = getSafeReplicateOutputUrl(rawUrl);
  const token = getReplicateToken(requestToken);
  const headers = new Headers();

  if (outputUrl.hostname === "api.replicate.com" && token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(outputUrl, { headers });

  if (!response.ok || !response.body) {
    throw new Error("Unable to fetch Replicate output.");
  }

  return response;
}
