import type { Prisma } from "@prisma/client";

export const publishingIntegrationSafeSelect = {
  id: true,
  internalId: true,
  organizationId: true,
  name: true,
  picture: true,
  providerIdentifier: true,
  type: true,
  disabled: true,
  tokenExpiration: true,
  profile: true,
  createdAt: true,
  updatedAt: true,
  refreshNeeded: true,
  additionalSettings: true,
} as const satisfies Prisma.IntegrationSelect;
