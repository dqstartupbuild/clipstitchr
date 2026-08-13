export type StudioReelWorkerCostReservation = {
  readonly alreadyReserved: boolean;
  readonly disposition: "reserved" | "uncertain";
  readonly reservationId: string;
};
