import { describe, expect, it } from "vitest";
import type { Doc } from "../_generated/dataModel";
import { getWaitlistMigrationTimestamp } from "./getWaitlistMigrationTimestamp";

describe("waitlist migration timestamp", () => {
  it("preserves a valid legacy timestamp and safely falls back", () => {
    expect(
      getWaitlistMigrationTimestamp({
        _creationTime: 10,
        createdAt: "2026-07-13T12:00:00.000Z",
      } as Doc<"waitlist">),
    ).toBe(Date.UTC(2026, 6, 13, 12));
    expect(
      getWaitlistMigrationTimestamp({
        _creationTime: 10,
        createdAt: "not-a-date",
      } as Doc<"waitlist">),
    ).toBe(10);
  });
});
