import type { StudioReelWorkerCostReservation } from "../../contracts/StudioReelWorkerCostReservation";

export async function reserveStudioReelDansUgcReconciliation(input: {
  readonly assertActive: () => Promise<void>;
  readonly invocationId: string;
  readonly reserve: (
    invocationId: string,
  ) => Promise<StudioReelWorkerCostReservation>;
}): Promise<void> {
  await input.assertActive();
  await input.reserve(input.invocationId);
  await input.assertActive();
}
