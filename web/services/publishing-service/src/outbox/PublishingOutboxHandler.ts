import type { LeasedPublishingOutboxRecord } from "../persistence/LeasedPublishingOutboxRecord.js";
import type { PublishingOutboxDisposition } from "./PublishingOutboxDisposition.js";

export type PublishingOutboxHandler = (
  record: LeasedPublishingOutboxRecord,
  signal: AbortSignal,
) => Promise<PublishingOutboxDisposition>;
