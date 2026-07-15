import { describe, expect, it, vi } from "vitest";
import { stopCourseReleasesForContact } from "./stopCourseReleasesForContact";

describe("course release stopping", () => {
  it("freezes active courses at the earliest suppression event", async () => {
    const entitlements = [
      { _id: "course_1", releaseStoppedAt: undefined },
      { _id: "course_2", releaseStoppedAt: 900 },
    ];
    const indexQuery = { eq: vi.fn(() => indexQuery) };
    const chain = {
      collect: vi.fn(async () => entitlements),
      withIndex: vi.fn((_name, callback) => {
        callback(indexQuery);
        return chain;
      }),
    };
    const ctx = {
      db: { patch: vi.fn(), query: vi.fn(() => chain) },
    };

    await stopCourseReleasesForContact(ctx as never, "contact_1" as never, 1_000);

    expect(ctx.db.patch).toHaveBeenCalledTimes(1);
    expect(ctx.db.patch).toHaveBeenCalledWith("course_1", {
      releaseStoppedAt: 1_000,
      updatedAt: 1_000,
    });
  });
});
