import { describe, expect, it } from "vitest";
import { getOldestQueueCandidatePerOwner } from "./getOldestQueueCandidatePerOwner";

describe("getOldestQueueCandidatePerOwner", () => {
  it("keeps one oldest candidate per owner so one backlog cannot monopolize selection", () => {
    const candidates = [
      { id: "owner-a-1", ownerId: "owner-a", queuedAt: "2026-07-16T00:00:00Z" },
      { id: "owner-a-2", ownerId: "owner-a", queuedAt: "2026-07-16T00:00:01Z" },
      { id: "owner-b-1", ownerId: "owner-b", queuedAt: "2026-07-16T00:00:02Z" },
    ];

    expect(getOldestQueueCandidatePerOwner(candidates)).toEqual([
      candidates[0],
      candidates[2],
    ]);
  });
});
