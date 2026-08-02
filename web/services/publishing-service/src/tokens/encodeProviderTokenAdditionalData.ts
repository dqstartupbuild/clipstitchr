import type { ProviderTokenContext } from "./ProviderTokenContext.js";

export const encodeProviderTokenAdditionalData = (
  context: ProviderTokenContext,
): Buffer =>
  Buffer.from(
    JSON.stringify([
      "clipstitchr-provider-token",
      1,
      context.tenantKey,
      context.provider,
      context.integrationId,
      context.tokenKind,
    ]),
    "utf8",
  );
