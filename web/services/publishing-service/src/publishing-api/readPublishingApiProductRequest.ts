import { PublishingServiceHttpError } from "../server/PublishingServiceHttpError.js";
import { assertExactPublishingApiKeys } from "./assertExactPublishingApiKeys.js";
import { readPublishingApiIdentifier } from "./readPublishingApiIdentifier.js";
import { readPublishingApiRecord } from "./readPublishingApiRecord.js";

export const readPublishingApiProductRequest = (
  value: unknown,
): Readonly<{ productId: string }> => {
  const record = readPublishingApiRecord(value, "invalid_product_request");
  assertExactPublishingApiKeys(
    record,
    ["productId"],
    [],
    "invalid_product_request",
  );
  try {
    return Object.freeze({
      productId: readPublishingApiIdentifier(
        record["productId"],
        "invalid_product_request",
      ),
    });
  } catch {
    throw new PublishingServiceHttpError(400, "invalid_product_request");
  }
};
