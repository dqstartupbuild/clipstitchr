import type { ClipstitchrConfig } from "../config/ClipstitchrConfig.js";
import type { ClipstitchrCredentials } from "../config/ClipstitchrCredentials.js";
import { getClipstitchrCredentialsAreUsable } from "../config/getClipstitchrCredentialsAreUsable.js";
import { resolveApiBaseUrl } from "../config/resolveApiBaseUrl.js";
import type { InteractiveShellContext } from "./InteractiveShellContext.js";

export function getInteractiveShellContext(input: {
  api?: string;
  config: ClipstitchrConfig;
  credentials: ClipstitchrCredentials | null;
  hasProjectConfig: boolean;
}): InteractiveShellContext {
  return {
    isAccountConnected: getClipstitchrCredentialsAreUsable({
      apiBaseUrl: resolveApiBaseUrl(input.config, input.api),
      credentials: input.credentials,
    }),
    isRepoLinked:
      input.hasProjectConfig && Boolean(input.config.productId?.trim()),
    productLabel: input.config.product?.name ?? input.config.productId,
  };
}
