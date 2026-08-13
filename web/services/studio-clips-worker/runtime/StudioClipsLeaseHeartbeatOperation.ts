import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import type { StudioClipsCheckpoint } from "../contracts/StudioClipsCheckpoint";
import { getStudioClipsClaimWorkId } from "../contracts/getStudioClipsClaimWorkId";
import type { StudioClipsProgressCode } from "../contracts/StudioClipsProgressCode";
import { getStudioClipsProgressPercent } from "../pipeline/getStudioClipsProgressPercent";

export class StudioClipsLeaseHeartbeatOperation {
  readonly #checkpoint: StudioClipsCheckpoint;
  readonly #claim: StudioClipsClaimEnvelope;
  readonly #code: StudioClipsProgressCode;
  readonly #http: StudioClipsWorkerHttpClient;
  readonly #intervalMs: number;
  #failure: unknown;
  #inFlight: Promise<void> | undefined;
  #stopped = false;
  #timeout: ReturnType<typeof setTimeout> | undefined;

  constructor(input: {
    checkpoint: StudioClipsCheckpoint;
    claim: StudioClipsClaimEnvelope;
    code: StudioClipsProgressCode;
    http: StudioClipsWorkerHttpClient;
    intervalMs: number;
  }) {
    this.#checkpoint = input.checkpoint;
    this.#claim = input.claim;
    this.#code = input.code;
    this.#http = input.http;
    this.#intervalMs = input.intervalMs;
  }

  async run<Result>(operation: () => Promise<Result>): Promise<Result> {
    this.#schedule();
    try {
      const result = await operation();
      this.#stopped = true;
      if (this.#timeout) clearTimeout(this.#timeout);
      await this.#inFlight;
      if (this.#failure) throw this.#failure;
      return result;
    } finally {
      this.#stopped = true;
      if (this.#timeout) clearTimeout(this.#timeout);
    }
  }

  async #publish(): Promise<void> {
    try {
      await this.#http.post("/api/studio/clips/worker/progress", {
        event: {
          attempt: this.#claim.attempt,
          checkpoint: this.#checkpoint,
          code: this.#code,
          occurredAt: new Date().toISOString(),
          ownerId: this.#claim.ownerId,
          productId: this.#claim.productId,
          progressPercent: getStudioClipsProgressPercent(this.#code),
          schemaVersion: "studio-clips-progress-v1",
          status: "processing",
          taskId: getStudioClipsClaimWorkId(this.#claim),
        },
        leaseId: this.#claim.leaseId,
      });
    } catch (error) {
      this.#failure = error;
    }
    if (!this.#stopped && !this.#failure) this.#schedule();
  }

  #schedule(): void {
    this.#timeout = setTimeout(() => {
      this.#inFlight = this.#publish();
      void this.#inFlight;
    }, this.#intervalMs);
    this.#timeout.unref();
  }
}
