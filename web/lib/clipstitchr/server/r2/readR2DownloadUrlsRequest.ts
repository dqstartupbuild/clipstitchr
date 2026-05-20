import { r2DownloadUrlBatchMaxKeys } from "@/lib/clipstitchr/constants/r2DownloadUrlBatchMaxKeys";

type R2DownloadUrlsRequest = {
  keys: string[];
};

export async function readR2DownloadUrlsRequest(
  request: Request,
): Promise<R2DownloadUrlsRequest> {
  const body = await request.json();

  if (!body || typeof body !== "object" || !("keys" in body)) {
    throw new Error("Choose at least one R2 object key.");
  }

  const keys = (body as Partial<R2DownloadUrlsRequest>).keys;

  if (!Array.isArray(keys)) {
    throw new Error("Choose at least one R2 object key.");
  }

  if (keys.length === 0) {
    throw new Error("Choose at least one R2 object key.");
  }

  if (keys.length > r2DownloadUrlBatchMaxKeys) {
    throw new Error(
      `Request at most ${r2DownloadUrlBatchMaxKeys} R2 object keys at once.`,
    );
  }

  const uniqueKeys = [...new Set(keys)];

  if (uniqueKeys.some((key) => typeof key !== "string" || key.trim() === "")) {
    throw new Error("R2 object keys must be non-empty strings.");
  }

  return {
    keys: uniqueKeys,
  };
}
