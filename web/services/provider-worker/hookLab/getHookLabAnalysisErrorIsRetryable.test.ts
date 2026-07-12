import { describe, expect, it } from "vitest";
import { getHookLabAnalysisErrorIsRetryable } from "./getHookLabAnalysisErrorIsRetryable";

describe("getHookLabAnalysisErrorIsRetryable", () => {
  it.each([
    "Unknown mime type: please set the mime_type argument",
    "Input validation failed for videos",
    "The imported link did not return a video.",
    "The social import start could not be confirmed.",
    "Hook Lab supports public videos up to 180 seconds.",
    "The imported video duration could not be read.",
    "The imported video response was empty.",
    "The saved Hook Lab source is not a video.",
    "The saved Hook Lab video was empty.",
    "The saved video is too large for Hook Lab.",
  ])("does not immediately retry a deterministic failure: %s", (message) => {
    expect(getHookLabAnalysisErrorIsRetryable(new Error(message))).toBe(false);
  });

  it.each([
    "fetch failed because ECONNRESET",
    "Prediction failed: provider service unavailable",
    "Replicate rate limit exceeded",
    "The imported video took too long to download.",
  ])("retries a transient failure: %s", (message) => {
    expect(getHookLabAnalysisErrorIsRetryable(new Error(message))).toBe(true);
  });
});
