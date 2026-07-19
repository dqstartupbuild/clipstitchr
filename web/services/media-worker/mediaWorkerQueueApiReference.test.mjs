import { getFunctionName } from "convex/server";
import { describe, expect, it } from "vitest";
import { mediaWorkerQueueApiReference } from "./mediaWorkerQueueApiReference.mjs";

describe("mediaWorkerQueueApiReference", () => {
  it("targets the nested Convex worker queue mutation", () => {
    expect(getFunctionName(mediaWorkerQueueApiReference)).toBe(
      "workerQueue/claimNextWorkerQueueEntry:claimNextWorkerQueueEntry",
    );
  });
});
