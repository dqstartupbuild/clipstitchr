import type { PrismaClient } from "@prisma/client";

import type { PublishingOutboxStore } from "../outbox/PublishingOutboxStore.js";
import { leasePublishingOutbox } from "./leasePublishingOutbox.js";
import { markPublishingOutboxDeadLetter } from "./markPublishingOutboxDeadLetter.js";
import { markPublishingOutboxDelivered } from "./markPublishingOutboxDelivered.js";
import { reschedulePublishingOutbox } from "./reschedulePublishingOutbox.js";

export const createPrismaPublishingOutboxStore = (
  database: PrismaClient,
): PublishingOutboxStore =>
  Object.freeze({
    lease: (input) => leasePublishingOutbox(database, input),
    markDelivered: (input) => markPublishingOutboxDelivered(database, input),
    reschedule: (input) => reschedulePublishingOutbox(database, input),
    markDeadLetter: (input) => markPublishingOutboxDeadLetter(database, input),
  });
