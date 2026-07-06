import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { LibrarySwipeSummary } from "../library/LibrarySwipeSummary.js";
import { requestJson } from "./requestJson.js";

type ListLibrarySwipesOptions = {
  limit?: number;
  productId?: string;
};

export async function listLibrarySwipes(
  credentials: ClipstitchrCredentials,
  options: ListLibrarySwipesOptions = {},
) {
  const search = new URLSearchParams();

  if (options.limit) {
    search.set("limit", String(options.limit));
  }

  if (options.productId) {
    search.set("productId", options.productId);
  }

  return await requestJson<{ swipes: LibrarySwipeSummary[] }>(
    credentials,
    `/api/cli/library/swipes${search.size ? `?${search.toString()}` : ""}`,
  );
}
