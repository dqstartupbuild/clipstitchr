import { ProviderTokenEnvelopeError } from "../errors/ProviderTokenEnvelopeError.js";
import type { ProviderTokenContext } from "./ProviderTokenContext.js";

const TENANT_KEY_PATTERN =
  /^clerk-(?:personal:user_[A-Za-z0-9_-]{2,255}|organization:org_[A-Za-z0-9_-]{2,255})$/;
const INTEGRATION_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const PROVIDERS = new Set([
  "instagram",
  "instagram-standalone",
  "tiktok",
  "youtube",
]);
const TOKEN_KINDS = new Set(["access", "refresh", "long-lived-access"]);

export const assertProviderTokenContext = (
  context: ProviderTokenContext,
): void => {
  if (
    !TENANT_KEY_PATTERN.test(context.tenantKey) ||
    !PROVIDERS.has(context.provider) ||
    !INTEGRATION_ID_PATTERN.test(context.integrationId) ||
    !TOKEN_KINDS.has(context.tokenKind)
  ) {
    throw new ProviderTokenEnvelopeError("malformed");
  }
};
