import type { LeasedPublishingOutboxRecord } from "../persistence/LeasedPublishingOutboxRecord.js";
import type { PublishingOutboxDispatcherOptions } from "./PublishingOutboxDispatcherOptions.js";
import { assertPublishingOutboxDispatcherOptions } from "./assertPublishingOutboxDispatcherOptions.js";
import { calculatePublishingOutboxRetryDate } from "./calculatePublishingOutboxRetryDate.js";
import { mapWithConcurrency } from "./mapWithConcurrency.js";
import { readSafePublishingOutboxErrorCode } from "./readSafePublishingOutboxErrorCode.js";

export class PublishingOutboxDispatcher {
  readonly #options: PublishingOutboxDispatcherOptions;
  readonly #now: () => Date;

  constructor(options: PublishingOutboxDispatcherOptions) {
    assertPublishingOutboxDispatcherOptions(options);
    this.#options = options;
    this.#now = options.now ?? (() => new Date());
  }

  async dispatchOnce(signal: AbortSignal): Promise<number> {
    if (signal.aborted) {
      return 0;
    }

    const leasedAt = this.#readNow();
    const records = await this.#options.store.lease({
      leaseOwner: this.#options.leaseOwner,
      limit: this.#options.leaseLimit,
      leaseDurationMilliseconds: this.#options.leaseDurationMilliseconds,
      now: leasedAt,
    });

    await mapWithConcurrency(records, this.#options.concurrency, async (record) => {
      await this.#dispatchRecord(record, signal);
    });

    return records.length;
  }

  async #dispatchRecord(
    record: LeasedPublishingOutboxRecord,
    signal: AbortSignal,
  ): Promise<void> {
    if (signal.aborted) {
      await this.#rescheduleAfterFailure(record, "worker_stopping");
      return;
    }

    try {
      const disposition = await this.#options.handler(record, signal);
      const resolvedAt = this.#readNow();

      if (disposition.kind === "complete") {
        await this.#options.store.markDelivered({
          outboxId: record.id,
          leaseOwner: this.#options.leaseOwner,
          deliveredAt: resolvedAt,
        });
        this.#options.logger.info("publishing_outbox_delivered", {
          outboxId: record.id,
          workflowId: record.workflowId,
          deliveryAttempts: record.deliveryAttempts,
        });
        return;
      }

      if (
        disposition.kind === "dead-letter" ||
        record.deliveryAttempts >= this.#options.maximumDeliveryAttempts
      ) {
        await this.#options.store.markDeadLetter({
          outboxId: record.id,
          leaseOwner: this.#options.leaseOwner,
          safeErrorCode:
            disposition.kind === "dead-letter"
              ? disposition.safeErrorCode
              : "delivery_attempts_exhausted",
          deadLetteredAt: resolvedAt,
        });
        this.#options.logger.error("publishing_outbox_dead_lettered", {
          outboxId: record.id,
          workflowId: record.workflowId,
          deliveryAttempts: record.deliveryAttempts,
        });
        return;
      }

      await this.#options.store.reschedule({
        outboxId: record.id,
        leaseOwner: this.#options.leaseOwner,
        availableAt: disposition.availableAt,
        safeErrorCode: disposition.safeErrorCode,
        rescheduledAt: resolvedAt,
      });
    } catch (error) {
      await this.#rescheduleAfterFailure(
        record,
        readSafePublishingOutboxErrorCode(error),
      );
    }
  }

  async #rescheduleAfterFailure(
    record: LeasedPublishingOutboxRecord,
    safeErrorCode: string,
  ): Promise<void> {
    const failedAt = this.#readNow();

    if (record.deliveryAttempts >= this.#options.maximumDeliveryAttempts) {
      await this.#options.store.markDeadLetter({
        outboxId: record.id,
        leaseOwner: this.#options.leaseOwner,
        safeErrorCode: "delivery_attempts_exhausted",
        deadLetteredAt: failedAt,
      });
      this.#options.logger.error("publishing_outbox_dead_lettered", {
        outboxId: record.id,
        workflowId: record.workflowId,
        deliveryAttempts: record.deliveryAttempts,
      });
      return;
    }

    await this.#options.store.reschedule({
      outboxId: record.id,
      leaseOwner: this.#options.leaseOwner,
      availableAt: calculatePublishingOutboxRetryDate(
        failedAt,
        record.deliveryAttempts,
      ),
      safeErrorCode,
      rescheduledAt: failedAt,
    });
    this.#options.logger.warn("publishing_outbox_rescheduled", {
      outboxId: record.id,
      workflowId: record.workflowId,
      deliveryAttempts: record.deliveryAttempts,
      safeErrorCode,
    });
  }

  #readNow(): Date {
    const now = this.#now();

    if (!Number.isSafeInteger(now.getTime())) {
      throw new TypeError("The outbox clock returned an invalid date.");
    }

    return now;
  }
}
