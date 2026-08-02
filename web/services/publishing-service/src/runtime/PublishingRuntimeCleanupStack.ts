import type { PublishingRuntimeCleanup } from "./PublishingRuntimeCleanup.js";

export class PublishingRuntimeCleanupStack {
  readonly #cleanups: PublishingRuntimeCleanup[] = [];

  add(cleanup: PublishingRuntimeCleanup): void {
    this.#cleanups.push(cleanup);
  }

  dismiss(): void {
    this.#cleanups.length = 0;
  }

  async run(): Promise<void> {
    const cleanups = this.#cleanups.splice(0).reverse();

    for (const cleanup of cleanups) {
      try {
        await cleanup();
      } catch {
        // Startup cleanup is best-effort and must not replace the root failure.
      }
    }
  }
}
