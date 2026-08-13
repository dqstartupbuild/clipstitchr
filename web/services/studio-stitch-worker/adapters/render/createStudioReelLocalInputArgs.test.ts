import { describe, expect, it } from "vitest";
import { createStudioReelLocalInputArgs } from "./createStudioReelLocalInputArgs";

describe("createStudioReelLocalInputArgs", () => {
  it("allows only local file and pipe protocols for FFmpeg inputs", () => {
    expect(createStudioReelLocalInputArgs("/workspace/input.mp4")).toEqual([
      "-protocol_whitelist",
      "file,pipe",
      "-i",
      "/workspace/input.mp4",
    ]);
  });
});
