import type { ServiceAssertionAction } from "./ServiceAssertionAction.js";

export type ServiceAssertionClaims = Readonly<{
  version: 1;
  issuer: string;
  audience: string;
  tenantKey: string;
  actorUserId: string;
  actorOrganizationId?: string;
  action: ServiceAssertionAction;
  requestId: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
}>;
