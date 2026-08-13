import { describe, expect, it, vi } from "vitest";

import type { PublishingOutboxDispatcher } from "../src/outbox/PublishingOutboxDispatcher.js";
import { runPublishingOutboxLoopWhenEnabled } from "../src/runtime/runPublishingOutboxLoopWhenEnabled.js";

describe("runPublishingOutboxLoopWhenEnabled", () => {
  it("does not lease any record while Studio Beta is disabled", async () => {
    const dispatchOnce = vi.fn();
    const controller = new AbortController();
    const loop = runPublishingOutboxLoopWhenEnabled(
      false,
      { dispatchOnce } as unknown as PublishingOutboxDispatcher,
      1_000,
      controller.signal,
    );

    await Promise.resolve();
    expect(dispatchOnce).not.toHaveBeenCalled();

    controller.abort();
    await expect(loop).resolves.toBeUndefined();
    expect(dispatchOnce).not.toHaveBeenCalled();
  });
});
