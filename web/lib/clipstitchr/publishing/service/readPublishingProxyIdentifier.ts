import { PublishingProxyRequestError } from "@/lib/clipstitchr/publishing/service/PublishingProxyRequestError";

const PUBLISHING_PROXY_IDENTIFIER_PATTERN =
  /^[A-Za-z0-9][A-Za-z0-9._~-]{0,127}$/u;

export function readPublishingProxyIdentifier(
  value: string | null | undefined,
): string {
  if (!value || !PUBLISHING_PROXY_IDENTIFIER_PATTERN.test(value)) {
    throw new PublishingProxyRequestError(400, "invalid_identifier");
  }

  return value;
}
