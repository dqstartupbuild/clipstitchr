import { getReplicateToken } from "@/lib/clipr/server/getReplicateToken";
import { getSafeReplicateOutputUrl } from "@/lib/clipr/server/getSafeReplicateOutputUrl";

export async function fetchReplicateOutput(rawUrl: string) {
  const outputUrl = getSafeReplicateOutputUrl(rawUrl);
  const token = getReplicateToken();
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
