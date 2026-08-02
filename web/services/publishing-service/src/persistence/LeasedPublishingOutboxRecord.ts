import type { Prisma } from "@prisma/client";

export type LeasedPublishingOutboxRecord = Readonly<{
  id: string;
  tenantId: string;
  postStateId: string;
  workflowId: string;
  eventType: string;
  eventVersion: number;
  payload: Prisma.JsonValue;
  status: "LEASED";
  availableAt: Date;
  leaseOwner: string;
  leaseExpiresAt: Date;
  deliveryAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}>;
