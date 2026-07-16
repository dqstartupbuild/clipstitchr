import type { ClerkUserEventType } from "./ClerkUserEventType";

type CurrentClerkAccountEvent = Readonly<{
  deletedAt?: number;
  lastClerkEventAt: number;
  lastClerkWebhookId: string;
}>;

export function getClerkAccountEventIsStale(
  current: CurrentClerkAccountEvent,
  incoming: Readonly<{
    eventAt: number;
    eventType: ClerkUserEventType;
    webhookId: string;
  }>,
) {
  if (incoming.eventAt !== current.lastClerkEventAt) {
    return incoming.eventAt < current.lastClerkEventAt;
  }

  if (incoming.eventType === "user.deleted" && current.deletedAt === undefined) {
    return false;
  }

  if (incoming.eventType !== "user.deleted" && current.deletedAt !== undefined) {
    return true;
  }

  return incoming.webhookId <= current.lastClerkWebhookId;
}
