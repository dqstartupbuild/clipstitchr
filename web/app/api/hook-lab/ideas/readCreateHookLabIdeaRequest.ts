import { canonicalizeHookLabSourceUrl } from "@/lib/clipstitchr/server/hookLab/canonicalizeHookLabSourceUrl";
import { createHookLabIdeaRequestKey } from "@/lib/clipstitchr/server/hookLab/createHookLabIdeaRequestKey";
import { getHookLabSourcePlatform } from "@/lib/clipstitchr/server/hookLab/getHookLabSourcePlatform";

export async function readCreateHookLabIdeaRequest(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const value = typeof body.value === "string" ? body.value.trim() : "";
  const stitchId =
    typeof body.stitchId === "string" ? body.stitchId.trim() : "";
  const hookOptionId =
    typeof body.hookOptionId === "string" ? body.hookOptionId.trim() : "";
  const productId =
    typeof body.productId === "string" ? body.productId.trim() : "";
  const scope = body.scope === "product" ? ("product" as const) : ("shared" as const);

  if (stitchId) {
    return {
      productId: productId || undefined,
      requestKey: createHookLabIdeaRequestKey(`stitch:${stitchId}:${scope}:${productId}`),
      scope,
      sourceStitchId: stitchId,
      sourceType: "stitch" as const,
    };
  }

  if (hookOptionId) {
    return {
      productId: productId || undefined,
      requestKey: createHookLabIdeaRequestKey(
        `generated-hook:${hookOptionId}:${scope}:${productId}`,
      ),
      scope,
      sourceHookOptionId: hookOptionId,
      sourceType: "generated_hook" as const,
    };
  }

  if (!value) {
    throw new Error("Paste a hook or public post link first.");
  }

  const sourcePlatform = getHookLabSourcePlatform(value);

  if (sourcePlatform) {
    const canonicalUrl = canonicalizeHookLabSourceUrl(value);

    return {
      canonicalUrl,
      productId: productId || undefined,
      requestKey: createHookLabIdeaRequestKey(
        `social:${canonicalUrl}:${scope}:${productId}`,
      ),
      scope,
      sourcePlatform,
      sourceType: "social_link" as const,
    };
  }

  if (/^https?:\/\//i.test(value)) {
    throw new Error("Paste a public TikTok or Instagram post link.");
  }

  const originalText = value.replace(/\s+/g, " ").slice(0, 2000);

  return {
    originalText,
    productId: productId || undefined,
    requestKey: createHookLabIdeaRequestKey(
      `text:${originalText.toLowerCase()}:${scope}:${productId}`,
    ),
    scope,
    sourceType: "text" as const,
  };
}
