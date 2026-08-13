import { describe, expect, it } from "vitest";
import { createStudioReelLocalProbeInputArgs } from "./createStudioReelLocalProbeInputArgs";

describe("createStudioReelLocalProbeInputArgs", () => {
  it("allows only local file and pipe protocols for FFprobe inputs", () => {
    expect(createStudioReelLocalProbeInputArgs("/workspace/input.mp4")).toEqual([
      "-protocol_whitelist",
      "file,pipe",
      "/workspace/input.mp4",
    ]);
  });
});
