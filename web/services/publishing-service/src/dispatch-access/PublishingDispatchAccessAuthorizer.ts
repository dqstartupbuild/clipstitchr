import type { PublishingDispatchAccessScope } from "./PublishingDispatchAccessScope.js";

export type PublishingDispatchAccessAuthorizer = (
  scope: PublishingDispatchAccessScope,
  signal: AbortSignal,
) => Promise<boolean>;
