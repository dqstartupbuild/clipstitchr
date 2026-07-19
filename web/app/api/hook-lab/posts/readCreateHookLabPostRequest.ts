import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";

export async function readCreateHookLabPostRequest(request: Request) {
  const body = (await request.json()) as { url?: unknown };
  const url = typeof body.url === "string" ? body.url.trim() : "";

  if (!url) {
    throw new Error("Paste a public TikTok or Instagram post link.");
  }

  const platform = getHookLabSourcePlatform(url);

  if (!platform) {
    throw new Error(
      "Use a public TikTok video or Instagram video post link.",
    );
  }

  return {
    canonicalUrl: canonicalizeHookLabSourceUrl(url),
    platform,
  };
}
