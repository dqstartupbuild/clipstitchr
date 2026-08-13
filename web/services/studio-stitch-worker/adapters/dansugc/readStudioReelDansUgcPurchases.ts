import type { StudioReelDansUgcPurchase } from "../../contracts/StudioReelDansUgcPurchase";
import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function readStudioReelDansUgcPurchases(
  payload: Record<string, unknown>,
): readonly StudioReelDansUgcPurchase[] {
  if (!Array.isArray(payload.purchases) || payload.purchases.length > 500) {
    throw new StudioReelWorkerError({
      code: "DANSUGC_PURCHASE_RESPONSE_INVALID",
      kind: "permanent",
      publicMessage: "DanSUGC returned an invalid purchase manifest.",
    });
  }
  return payload.purchases.map((value) => {
    const purchase = value as Record<string, unknown>;
    if (
      !purchase ||
      Array.isArray(purchase) ||
      typeof purchase !== "object" ||
      typeof purchase.video_id !== "string" ||
      purchase.video_id.length < 1 ||
      purchase.video_id.length > 240 ||
      typeof purchase.download_url !== "string" ||
      purchase.download_url.length < 1 ||
      purchase.download_url.length > 8_192 ||
      typeof purchase.price_paid !== "number" ||
      !Number.isFinite(purchase.price_paid) ||
      purchase.price_paid < 0 ||
      typeof purchase.currency !== "string" ||
      !/^[A-Z]{3}$/u.test(purchase.currency) ||
      typeof purchase.purchased_at !== "string" ||
      !Number.isFinite(Date.parse(purchase.purchased_at))
    ) {
      throw new StudioReelWorkerError({
        code: "DANSUGC_PURCHASE_RESPONSE_INVALID",
        kind: "permanent",
        publicMessage: "DanSUGC returned an invalid purchase manifest.",
      });
    }
    return {
      currency: purchase.currency,
      downloadUrl: purchase.download_url,
      pricePaid: purchase.price_paid,
      purchasedAt: purchase.purchased_at,
      videoId: purchase.video_id,
    };
  });
}
