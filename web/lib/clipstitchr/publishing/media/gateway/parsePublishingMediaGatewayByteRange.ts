import type { PublishingMediaGatewayByteRange } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayByteRange";
import { PublishingMediaGatewayRangeError } from "@/lib/clipstitchr/publishing/media/gateway/PublishingMediaGatewayRangeError";

export function parsePublishingMediaGatewayByteRange(
  rangeHeader: string | null,
  sizeBytes: number,
): PublishingMediaGatewayByteRange | null {
  if (!rangeHeader) {
    return null;
  }

  const match = /^bytes=(\d*)-(\d*)$/i.exec(rangeHeader.trim());

  if (!match || rangeHeader.includes(",") || (!match[1] && !match[2])) {
    throw new PublishingMediaGatewayRangeError();
  }

  let start: number;
  let end: number;

  if (!match[1]) {
    const suffixLength = Number(match[2]);

    if (!Number.isSafeInteger(suffixLength) || suffixLength < 1) {
      throw new PublishingMediaGatewayRangeError();
    }

    start = Math.max(0, sizeBytes - suffixLength);
    end = sizeBytes - 1;
  } else {
    start = Number(match[1]);
    end = match[2] ? Number(match[2]) : sizeBytes - 1;

    if (
      !Number.isSafeInteger(start) ||
      !Number.isSafeInteger(end) ||
      start < 0 ||
      start >= sizeBytes ||
      end < start
    ) {
      throw new PublishingMediaGatewayRangeError();
    }

    end = Math.min(end, sizeBytes - 1);
  }

  return Object.freeze({
    contentRange: `bytes ${start}-${end}/${sizeBytes}`,
    end,
    length: end - start + 1,
    requestHeader: `bytes=${start}-${end}`,
    start,
  });
}
