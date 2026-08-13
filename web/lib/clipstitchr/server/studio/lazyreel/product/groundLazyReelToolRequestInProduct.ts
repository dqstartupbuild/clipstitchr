import type { LazyReelToolRequest } from "@/lib/clipstitchr/types/lazyreel/LazyReelToolRequest";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { createLazyReelGroundedProductDescription } from "./createLazyReelGroundedProductDescription";

export function groundLazyReelToolRequestInProduct(
  request: LazyReelToolRequest,
  product: ProductProfile,
): LazyReelToolRequest {
  if (request.tool === "make_brief") {
    return {
      ...request,
      audience: request.audience?.trim() || product.audienceDetails.trim(),
      product: createLazyReelGroundedProductDescription(product),
    };
  }

  if (request.tool === "teardown" && !request.video) {
    return {
      ...request,
      product: createLazyReelGroundedProductDescription(product),
    };
  }

  return request;
}
