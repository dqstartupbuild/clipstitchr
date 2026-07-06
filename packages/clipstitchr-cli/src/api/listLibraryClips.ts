import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import type { ClipLibraryKind } from "../library/ClipLibraryKind.js";
import type { LibraryClipSummary } from "../library/LibraryClipSummary.js";
import { requestJson } from "./requestJson.js";

type ListLibraryClipsOptions = {
  kind?: ClipLibraryKind;
  limit?: number;
  productId?: string;
};

export async function listLibraryClips(
  credentials: ClipstitchrCredentials,
  options: ListLibraryClipsOptions = {},
) {
  const search = new URLSearchParams();

  if (options.kind) {
    search.set("kind", options.kind);
  }

  if (options.limit) {
    search.set("limit", String(options.limit));
  }

  if (options.productId) {
    search.set("productId", options.productId);
  }

  return await requestJson<{ clips: LibraryClipSummary[] }>(
    credentials,
    `/api/cli/library/clips${search.size ? `?${search.toString()}` : ""}`,
  );
}
