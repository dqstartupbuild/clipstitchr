import { describe, expect, it } from "vitest";
import { getStudioClipsStatusTransitionIsAllowed } from "./getStudioClipsStatusTransitionIsAllowed";

describe("getStudioClipsStatusTransitionIsAllowed", () => {
  it("allows the normal and resumable lifecycle", () => {
    expect(getStudioClipsStatusTransitionIsAllowed("queued", "processing")).toBe(
      true,
    );
    expect(
      getStudioClipsStatusTransitionIsAllowed("processing", "completed"),
    ).toBe(true);
    expect(getStudioClipsStatusTransitionIsAllowed("error", "queued")).toBe(true);
    expect(getStudioClipsStatusTransitionIsAllowed("cancelled", "queued")).toBe(
      true,
    );
  });

  it("keeps terminal and invalid transitions closed", () => {
    expect(getStudioClipsStatusTransitionIsAllowed("completed", "queued")).toBe(
      false,
    );
    expect(
      getStudioClipsStatusTransitionIsAllowed("processing", "queued"),
    ).toBe(false);
    expect(getStudioClipsStatusTransitionIsAllowed("queued", "completed")).toBe(
      false,
    );
  });
});
