import { readStudioBetaBoundedJsonObject } from "@/lib/clipstitchr/server/studio/http/readStudioBetaBoundedJsonObject";
import { assertStudioBetaJsonExactKeys } from "@/lib/clipstitchr/server/studio/http/assertStudioBetaJsonExactKeys";

export async function readStudioBetaR2DownloadUrlRequest(request: Request) {
  const body = await readStudioBetaBoundedJsonObject(request);
  assertStudioBetaJsonExactKeys(body, ["key", "productId"]);

  if (typeof body.key !== "string" || body.key.length === 0) {
    throw new Error("Missing R2 object key.");
  }

  if (
    typeof body.productId !== "string" ||
    body.productId.length === 0 ||
    body.productId.length > 128 ||
    !/^[A-Za-z0-9_-]+$/.test(body.productId)
  ) {
    throw new Error("Choose an active Product for this Studio file.");
  }

  return { key: body.key, productId: body.productId };
}
