import { readStudioBetaBoundedJsonObject } from "@/lib/clipstitchr/server/studio/http/readStudioBetaBoundedJsonObject";
import type { StudioPublishingDispatchAccessRequest } from "@/lib/clipstitchr/types/studioPublishing/StudioPublishingDispatchAccessRequest";

const CLERK_USER_ID_PATTERN = /^user_[A-Za-z0-9_-]{2,255}$/u;
const PRODUCT_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/u;

export async function readStudioPublishingDispatchAccessRequest(
  request: Request,
): Promise<StudioPublishingDispatchAccessRequest> {
  const body = await readStudioBetaBoundedJsonObject(request, 4 * 1_024);

  if (
    Object.keys(body).length !== 2 ||
    !Object.hasOwn(body, "ownerId") ||
    !Object.hasOwn(body, "productId") ||
    typeof body.ownerId !== "string" ||
    !CLERK_USER_ID_PATTERN.test(body.ownerId) ||
    typeof body.productId !== "string" ||
    !PRODUCT_ID_PATTERN.test(body.productId)
  ) {
    throw new Error("The publishing dispatch access request is invalid.");
  }

  return Object.freeze({
    ownerId: body.ownerId,
    productId: body.productId,
  });
}
