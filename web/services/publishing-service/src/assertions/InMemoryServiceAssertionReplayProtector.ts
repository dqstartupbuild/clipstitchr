import type { ServiceAssertionReplayProtector } from "./ServiceAssertionReplayProtector.js";

export class InMemoryServiceAssertionReplayProtector
  implements ServiceAssertionReplayProtector
{
  readonly #consumedAssertions = new Map<string, number>();
  readonly #now: () => number;

  constructor(now: () => number = Date.now) {
    this.#now = now;
  }

  async consume(
    replayKey: string,
    expiresAtEpochMilliseconds: number,
  ): Promise<boolean> {
    const now = this.#now();

    for (const [storedKey, storedExpiry] of this.#consumedAssertions) {
      if (storedExpiry <= now) {
        this.#consumedAssertions.delete(storedKey);
      }
    }

    if (expiresAtEpochMilliseconds <= now) {
      return false;
    }

    if (this.#consumedAssertions.has(replayKey)) {
      return false;
    }

    this.#consumedAssertions.set(replayKey, expiresAtEpochMilliseconds);
    return true;
  }
}
