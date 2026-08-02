import type { readPublishingDestinationForDispatch } from "../persistence/readPublishingDestinationForDispatch.js";

export type PrismaPublishingDispatchRecord = Awaited<
  ReturnType<typeof readPublishingDestinationForDispatch>
>;
