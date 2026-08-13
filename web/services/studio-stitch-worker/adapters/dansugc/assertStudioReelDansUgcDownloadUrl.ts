import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";

export function assertStudioReelDansUgcDownloadUrl(
  value: string,
  allowedHosts: readonly string[],
) {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new StudioReelWorkerError({
      code: "DANSUGC_DOWNLOAD_URL_INVALID",
      kind: "permanent",
      publicMessage: "DanSUGC returned an invalid purchased media location.",
    });
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    url.hash ||
    !url.pathname.startsWith("/") ||
    !allowedHosts.includes(url.hostname.toLowerCase())
  ) {
    throw new StudioReelWorkerError({
      code: "DANSUGC_DOWNLOAD_URL_INVALID",
      kind: "permanent",
      publicMessage: "DanSUGC returned an unapproved purchased media location.",
    });
  }
  return url;
}
