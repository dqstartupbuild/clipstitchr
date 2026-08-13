import { lazyReelResearchInputLimits } from "@/lib/clipstitchr/server/studio/lazyreel/http/lazyReelResearchInputLimits";
import { readLazyReelRequiredString } from "@/lib/clipstitchr/server/studio/lazyreel/http/readLazyReelRequiredString";

export function readStudioLazyReelCatalogProductId(request: Request) {
  return readLazyReelRequiredString(
    new URL(request.url).searchParams.get("productId"),
    "Product",
    lazyReelResearchInputLimits.productId,
  );
}
