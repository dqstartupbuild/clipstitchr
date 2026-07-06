import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { LibraryStitchSummary } from "../library/LibraryStitchSummary.js";
import { requestJson } from "./requestJson.js";

type ListLibraryStitchesOptions = {
  limit?: number;
  productId?: string;
  readyOnly?: boolean;
};

export async function listLibraryStitches(
  credentials: ClipstitchrCredentials,
  options: ListLibraryStitchesOptions = {},
) {
  const search = new URLSearchParams();

  if (options.limit) {
    search.set("limit", String(options.limit));
  }

  if (options.productId) {
    search.set("productId", options.productId);
  }

  if (options.readyOnly) {
    search.set("readyOnly", "1");
  }

  return await requestJson<{ stitches: LibraryStitchSummary[] }>(
    credentials,
    `/api/cli/library/stitches${search.size ? `?${search.toString()}` : ""}`,
  );
}
