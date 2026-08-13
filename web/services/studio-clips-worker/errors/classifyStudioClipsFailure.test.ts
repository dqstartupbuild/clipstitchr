import { describe, expect, it } from "vitest";
import { StudioClipsWorkerError } from "./StudioClipsWorkerError";
import { classifyStudioClipsFailure } from "./classifyStudioClipsFailure";

describe("classifyStudioClipsFailure", () => {
  it("preserves typed failure policy while redacting its public message", () => {
    const failure = classifyStudioClipsFailure(
      new StudioClipsWorkerError({
        code: "PROVIDER_RATE_LIMITED",
        kind: "retryable",
        publicMessage:
          "Try https://r2.test/file?X-Amz-Signature=secret token=hidden",
      }),
      1,
    );

    expect(failure).toMatchObject({
      code: "PROVIDER_RATE_LIMITED",
      kind: "retryable",
    });
    expect(failure.message).toContain("[REDACTED]");
    expect(failure.message).not.toContain("secret");
    expect(failure.message).not.toContain("hidden");
  });

  it("makes network failures retryable and exhausts unknown failures", () => {
    expect(
      classifyStudioClipsFailure(Object.assign(new Error(), { status: 503 }), 1)
        .kind,
    ).toBe("retryable");
    expect(classifyStudioClipsFailure(new Error(), 5)).toMatchObject({
      code: "ATTEMPTS_EXHAUSTED",
      kind: "permanent",
    });
    expect(
      classifyStudioClipsFailure(Object.assign(new Error(), { status: 415 }), 1),
    ).toMatchObject({
      code: "PERMANENT_PROVIDER_FAILURE",
      kind: "permanent",
    });
  });
});
