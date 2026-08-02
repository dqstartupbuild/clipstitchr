import type { Redis } from "ioredis";

import { PublishingRedisUnavailableError } from "../errors/PublishingRedisUnavailableError.js";
import { IoredisPublishingSecurityCommands } from "./IoredisPublishingSecurityCommands.js";
import type { PublishingRedisRuntime } from "./PublishingRedisRuntime.js";

export class IoredisPublishingRedisRuntime implements PublishingRedisRuntime {
  readonly commands: IoredisPublishingSecurityCommands;
  readonly #client: Redis;
  #closed = false;
  #connectionAttempt: Promise<void> | undefined;

  constructor(client: Redis) {
    this.#client = client;
    this.commands = new IoredisPublishingSecurityCommands(client);
  }

  async connect(): Promise<void> {
    if (this.#closed) {
      throw new PublishingRedisUnavailableError();
    }

    if (this.#client.status === "ready") {
      await this.assertReady();
      return;
    }

    const connectionAttempt = this.#connectionAttempt ?? this.#establishConnection();
    this.#connectionAttempt = connectionAttempt;

    try {
      await connectionAttempt;
    } finally {
      if (this.#connectionAttempt === connectionAttempt) {
        this.#connectionAttempt = undefined;
      }
    }
  }

  async assertReady(): Promise<void> {
    if (this.#closed || this.#client.status !== "ready") {
      throw new PublishingRedisUnavailableError();
    }

    try {
      if ((await this.#client.ping()) !== "PONG") {
        throw new PublishingRedisUnavailableError();
      }
    } catch {
      this.#client.disconnect(false);
      throw new PublishingRedisUnavailableError();
    }
  }

  async close(): Promise<void> {
    if (this.#closed) {
      return;
    }

    this.#closed = true;

    try {
      if (this.#client.status === "ready") {
        await this.#client.quit();
        return;
      }
    } catch {
      // Shutdown remains best-effort and never exposes connection details.
    }

    this.#client.disconnect(false);
  }

  async #establishConnection(): Promise<void> {
    try {
      await this.#client.connect();
      await this.assertReady();
    } catch {
      this.#client.disconnect(false);
      throw new PublishingRedisUnavailableError();
    }
  }
}
