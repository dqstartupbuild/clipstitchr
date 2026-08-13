import { describe, expect, it } from "vitest";
import { classifyStudioReelWorkerPublicError } from "./classifyStudioReelWorkerPublicError";

describe("classifyStudioReelWorkerPublicError", () => {
  it("maps authentication and lease failures to fixed copy", () => {
    expect(
      classifyStudioReelWorkerPublicError(
        new Error("Unauthorized Studio Stitch worker request."),
      ),
    ).toEqual({
      message: "Studio Stitch worker authentication failed.",
      status: 401,
    });
    expect(
      classifyStudioReelWorkerPublicError(new Error("Worker lease expired.")),
    ).toEqual({
      message: "Studio Stitch worker state changed. Claim it again.",
      status: 409,
    });
  });

  it("does not expose an object key or signed URL", () => {
    expect(
      classifyStudioReelWorkerPublicError(
        new Error(
          "users/owner/studio/output.mp4 at https://r2.test?token=hidden",
        ),
      ),
    ).toEqual({
      message: "Studio Stitch worker request failed.",
      status: 500,
    });
  });
});
