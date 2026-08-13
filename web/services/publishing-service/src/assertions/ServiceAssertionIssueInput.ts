import type { ClerkTenantIdentity } from "../identity/ClerkTenantIdentity.js";
import type { ServiceAssertionAction } from "./ServiceAssertionAction.js";
import type { ServiceAssertionSigningKey } from "./ServiceAssertionSigningKey.js";

export type ServiceAssertionIssueInput = Readonly<{
  issuer: string;
  audience: string;
  action: ServiceAssertionAction;
  requestId: string;
  identity: ClerkTenantIdentity;
  signingKey: ServiceAssertionSigningKey;
  ttlSeconds?: number;
  nowEpochSeconds?: number;
}>;
