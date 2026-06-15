import { afterEach, describe, expect, it, vi } from "vitest";
import { logGeminiVideoAnalysisInputDiagnostics } from "@/lib/clipstitchr/server/logGeminiVideoAnalysisInputDiagnostics";
import { logGeminiVideoAnalysisPredictionDiagnostics } from "@/lib/clipstitchr/server/logGeminiVideoAnalysisPredictionDiagnostics";
import { redactGeminiVideoAnalysisR2Key } from "@/lib/clipstitchr/server/redactGeminiVideoAnalysisR2Key";

describe("Gemini video analysis diagnostics", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("logs safe signed URL diagnostics without leaking the full URL or user key", async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      if (init?.method === "HEAD") {
        return new Response(null, {
          status: 403,
          headers: {
            "content-type": "text/plain",
          },
        });
      }

      return new Response(new Uint8Array([1, 2, 3, 4]), {
        status: 206,
        headers: {
          "content-length": "4",
          "content-range": "bytes 0-3/42",
        },
      });
    });
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    vi.stubGlobal("fetch", fetchMock);

    await logGeminiVideoAnalysisInputDiagnostics({
      diagnostics: {
        featurePath: "clip-score",
        inputMode: "signed-url",
        objectContentType: "video/mp4",
        objectKey: "users/user_123/video-clips/clip_123/video.mp4",
        objectSize: 42,
        signedUrlExpiresSeconds: 900,
        sourceUrl:
          "https://account.r2.cloudflarestorage.com/bucket/video.mp4?X-Amz-Signature=secret",
      },
      modelId: "google/gemini-3-flash",
    });

    const payload = JSON.parse(String(infoSpy.mock.calls[0]?.[0])) as {
      [key: string]: unknown;
    };

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("X-Amz-Signature=secret"),
      { method: "HEAD" },
    );
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("X-Amz-Signature=secret"),
      { headers: { range: "bytes=0-15" } },
    );
    expect(payload).toMatchObject({
      event: "gemini-video-analysis-input",
      featurePath: "clip-score",
      modelId: "google/gemini-3-flash",
      inputMode: "signed-url",
      urlHost: "account.r2.cloudflarestorage.com",
      r2ObjectKey: "video-clips/.../video.mp4",
      objectContentType: "video/mp4",
      objectSize: 42,
      signedUrlExpiresSeconds: 900,
      headOk: false,
      headStatus: 403,
      headContentType: "text/plain",
      rangeOk: true,
      rangeStatus: 206,
      rangeContentLength: "4",
      rangeContentRange: "bytes 0-3/42",
    });
    expect(JSON.stringify(payload)).not.toContain("X-Amz-Signature");
    expect(JSON.stringify(payload)).not.toContain("user_123");
    expect(JSON.stringify(payload)).not.toContain("clip_123");
  });

  it("redacts prediction errors before logging them", () => {
    const infoSpy = vi.spyOn(console, "info").mockImplementation(() => {});

    logGeminiVideoAnalysisPredictionDiagnostics({
      diagnostics: {
        featurePath: "upload-analysis",
        modelId: "google/gemini-3-flash",
      },
      prediction: {
        error:
          "Provider could not fetch https://account.r2.cloudflarestorage.com/bucket/video.mp4?X-Amz-Signature=secret",
        id: "prediction_123",
        status: "failed",
      },
    });

    const payload = JSON.parse(String(infoSpy.mock.calls[0]?.[0])) as {
      predictionError?: string;
    };

    expect(payload).toMatchObject({
      event: "gemini-video-analysis-prediction",
      featurePath: "upload-analysis",
      modelId: "google/gemini-3-flash",
      predictionId: "prediction_123",
      predictionStatus: "failed",
      predictionError: "Provider could not fetch [redacted-url]",
    });
  });

  it("redacts user-owned R2 keys to only the media bucket area and file name", () => {
    expect(
      redactGeminiVideoAnalysisR2Key(
        "users/user_123/stitches/stitch_123/video.mp4",
      ),
    ).toBe("stitches/.../video.mp4");
  });
});
