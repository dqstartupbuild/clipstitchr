import { StudioReelWorkerError } from "../../errors/StudioReelWorkerError";
import { writeStudioReelProviderBody } from "../providers/writeStudioReelProviderBody";
import { assertStudioReelDansUgcDownloadUrl } from "./assertStudioReelDansUgcDownloadUrl";

export async function downloadStudioReelDansUgcVideo(input: {
  readonly allowedHosts: readonly string[];
  readonly downloadUrl: string;
  readonly fetch?: typeof fetch;
  readonly maximumBytes: number;
  readonly outputPath: string;
}) {
  const url = assertStudioReelDansUgcDownloadUrl(
    input.downloadUrl,
    input.allowedHosts,
  );
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 120_000);
  try {
    const response = await (input.fetch ?? fetch)(url, {
      method: "GET",
      redirect: "error",
      signal: controller.signal,
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => undefined);
      throw new StudioReelWorkerError({
        code: "DANSUGC_DOWNLOAD_REJECTED",
        kind:
          response.status === 408 ||
          response.status === 429 ||
          response.status >= 500
            ? "retryable"
            : "permanent",
        publicMessage: "DanSUGC reaction media could not be downloaded.",
      });
    }
    const contentType = response.headers
      .get("content-type")
      ?.toLowerCase()
      .split(";", 1)[0];
    if (
      contentType &&
      !["video/mp4", "application/octet-stream"].includes(contentType)
    ) {
      await response.body?.cancel().catch(() => undefined);
      throw new StudioReelWorkerError({
        code: "DANSUGC_DOWNLOAD_TYPE_INVALID",
        kind: "permanent",
        publicMessage: "DanSUGC returned unsupported reaction media.",
      });
    }
    return await writeStudioReelProviderBody({
      maximumBytes: input.maximumBytes,
      outputPath: input.outputPath,
      response,
    });
  } catch (error) {
    if (error instanceof StudioReelWorkerError) throw error;
    throw new StudioReelWorkerError({
      cause: error,
      code: "DANSUGC_DOWNLOAD_UNAVAILABLE",
      kind: "retryable",
      publicMessage: "DanSUGC reaction media is temporarily unavailable.",
    });
  } finally {
    clearTimeout(timeout);
  }
}
