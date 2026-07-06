import { describe, expect, it } from "vitest";
import { readUploadInteractionEvents } from "./readUploadInteractionEvents.mjs";

describe("readUploadInteractionEvents", () => {
  it("keeps valid click and mousemove events", () => {
    expect(
      readUploadInteractionEvents([
        {
          type: "click",
          timestampMs: 0,
          x: 120,
          y: 240,
          viewportWidth: 1440,
          viewportHeight: 900,
        },
        {
          type: "mousemove",
          timestampMs: 1250.2,
          x: 140,
          y: 260,
          viewportWidth: 1440,
          viewportHeight: 900,
        },
      ]),
    ).toEqual([
      {
        type: "click",
        timestampMs: 0,
        x: 120,
        y: 240,
        viewportWidth: 1440,
        viewportHeight: 900,
      },
      {
        type: "mousemove",
        timestampMs: 1250,
        x: 140,
        y: 260,
        viewportWidth: 1440,
        viewportHeight: 900,
      },
    ]);
  });

  it("drops invalid events", () => {
    expect(
      readUploadInteractionEvents([
        { type: "scroll", timestampMs: 1 },
        { type: "click", timestampMs: 1, x: 1, y: 1, viewportWidth: 0 },
      ]),
    ).toEqual([]);
  });
});
