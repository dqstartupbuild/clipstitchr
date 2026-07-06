import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { ProductSummary } from "./ProductSummary.js";
import { requestJson } from "./requestJson.js";

export async function createProduct(
  credentials: ClipstitchrCredentials,
  input: {
    audienceDetails: string;
    name: string;
    productDetails: string;
  },
) {
  return await requestJson<{ product: ProductSummary }>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/products",
    {
      body: JSON.stringify(input),
      method: "POST",
    },
  );
}
