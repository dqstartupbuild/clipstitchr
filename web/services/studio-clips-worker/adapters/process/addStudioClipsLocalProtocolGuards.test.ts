import { describe, expect, it } from "vitest";
import { addStudioClipsLocalProtocolGuards } from "./addStudioClipsLocalProtocolGuards";

describe("addStudioClipsLocalProtocolGuards", () => {
  it("places a file-and-pipe-only allowlist before every media input", () => {
    const args = addStudioClipsLocalProtocolGuards([
      "-y",
      "-i",
      "https://attacker.test/source.m3u8",
      "-i",
      "file:///workspace/broll.mp4",
      "/workspace/output.mp4",
    ]);

    expect(args).toEqual([
      "-y",
      "-protocol_whitelist",
      "file,pipe",
      "-i",
      "https://attacker.test/source.m3u8",
      "-protocol_whitelist",
      "file,pipe",
      "-i",
      "file:///workspace/broll.mp4",
      "/workspace/output.mp4",
    ]);
    expect(args.join(" ")).not.toContain("file,http");
    expect(args.join(" ")).not.toContain("file,https");
  });
});
