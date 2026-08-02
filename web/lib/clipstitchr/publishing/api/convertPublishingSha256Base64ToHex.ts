import "server-only";

import { isSha256Base64Checksum } from "@/lib/clipstitchr/publishing/media/isSha256Base64Checksum";
import { PublishingMediaValidationError } from "@/lib/clipstitchr/publishing/media/PublishingMediaValidationError";

export function convertPublishingSha256Base64ToHex(
  checksum: string | undefined,
): string {
  const encodedChecksum = checksum?.startsWith("sha256:")
    ? checksum.slice("sha256:".length)
    : undefined;

  if (!isSha256Base64Checksum(encodedChecksum)) {
    throw new PublishingMediaValidationError(
      "missing_immutable_identity",
      "Publishing media requires a durable SHA-256 checksum.",
    );
  }

  const bytes = Buffer.from(encodedChecksum, "base64");
  if (
    bytes.byteLength !== 32 ||
    bytes.toString("base64") !== encodedChecksum
  ) {
    throw new PublishingMediaValidationError(
      "invalid_metadata",
      "Publishing media has an invalid SHA-256 checksum.",
    );
  }

  return bytes.toString("hex");
}
