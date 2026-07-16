import type { UsageOperation } from "./UsageOperation";
import type { UsageReservationKind } from "./UsageReservationKind";
import type { UsageResource } from "./UsageResource";

export type UsageReservationCommitBinding = {
  domainId: string;
  domainKind: string;
  operation: UsageOperation;
  reservationKind: UsageReservationKind;
  resource: UsageResource;
};
