import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { ProductSummary } from "./ProductSummary.js";
import { requestJson } from "./requestJson.js";

export async function listProducts(credentials: ClipstitchrCredentials) {
  return await requestJson<{ products: ProductSummary[] }>(
    {
      accessToken: credentials.accessToken,
      apiBaseUrl: credentials.apiBaseUrl,
    },
    "/api/cli/products",
  );
}
