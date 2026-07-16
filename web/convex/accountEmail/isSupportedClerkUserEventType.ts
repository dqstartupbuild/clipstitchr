import type { ClerkUserEventType } from "./ClerkUserEventType";

export function isSupportedClerkUserEventType(
  eventType: string,
): eventType is ClerkUserEventType {
  return (
    eventType === "user.created" ||
    eventType === "user.updated" ||
    eventType === "user.deleted"
  );
}
