// @vitest-environment jsdom

import { describe, expect, it } from "vitest";
import { validateStudioClipsVideoFile } from "./validateStudioClipsVideoFile";

describe("validateStudioClipsVideoFile", () => {
  it("accepts a bounded supported video", () => {
    const file = new File(["video"], "source.mp4", { type: "video/mp4" });

    expect(validateStudioClipsVideoFile(file)).toBe(file);
  });

  it("rejects unsupported media and files over the worker cap", () => {
    expect(() =>
      validateStudioClipsVideoFile(
        new File(["text"], "notes.txt", { type: "text/plain" }),
      ),
    ).toThrow("Choose an MP4, MOV, WebM, M4V, or MKV video.");

    const hugeFile = new File(["x"], "huge.mp4", { type: "video/mp4" });
    Object.defineProperty(hugeFile, "size", { value: 1_073_741_825 });
    expect(() => validateStudioClipsVideoFile(hugeFile)).toThrow(
      "Choose a video smaller than 1 GB.",
    );
  });
});
