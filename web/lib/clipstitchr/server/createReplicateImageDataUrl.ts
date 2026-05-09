import { fetchReplicateOutput } from "@/lib/clipstitchr/server/fetchReplicateOutput";

export async function createReplicateImageDataUrl(url: string) {
  const response = await fetchReplicateOutput(url);
  const mimeType = response.headers.get("content-type") ?? "image/jpeg";
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return {
    dataUrl: `data:${mimeType};base64,${base64}`,
    mimeType,
  };
}
