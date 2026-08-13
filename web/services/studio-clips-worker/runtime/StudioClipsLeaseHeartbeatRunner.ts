import type { StudioClipsWorkerHttpClient } from "../adapters/http/StudioClipsWorkerHttpClient";
import type { StudioClipsClaimEnvelope } from "../contracts/StudioClipsClaimEnvelope";
import type { StudioClipsCheckpoint } from "../contracts/StudioClipsCheckpoint";
import type { StudioClipsProgressCode } from "../contracts/StudioClipsProgressCode";
import type { StudioClipsLeaseHeartbeat } from "./StudioClipsLeaseHeartbeat";
import { StudioClipsLeaseHeartbeatOperation } from "./StudioClipsLeaseHeartbeatOperation";

export class StudioClipsLeaseHeartbeatRunner implements StudioClipsLeaseHeartbeat {
  readonly #claim: StudioClipsClaimEnvelope;
  readonly #http: StudioClipsWorkerHttpClient;
  readonly #intervalMs: number;

  constructor(input: {
    claim: StudioClipsClaimEnvelope;
    http: StudioClipsWorkerHttpClient;
    intervalMs: number;
  }) {
    this.#claim = input.claim;
    this.#http = input.http;
    this.#intervalMs = input.intervalMs;
  }

  async run<Result>(input: {
    checkpoint: StudioClipsCheckpoint;
    code: StudioClipsProgressCode;
    operation: () => Promise<Result>;
  }): Promise<Result> {
    return new StudioClipsLeaseHeartbeatOperation({
      checkpoint: input.checkpoint,
      claim: this.#claim,
      code: input.code,
      http: this.#http,
      intervalMs: this.#intervalMs,
    }).run(input.operation);
  }
}
