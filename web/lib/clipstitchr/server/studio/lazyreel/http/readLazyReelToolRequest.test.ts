import { describe, expect, it } from "vitest";
import { readLazyReelToolRequest } from "./readLazyReelToolRequest";

describe("readLazyReelToolRequest", () => {
  it("requires a niche for niche-specific report focuses", () => {
    expect(() =>
      readLazyReelToolRequest({ focus: "overview", tool: "niche_report" }),
    ).toThrow("Choose a niche");
  });

  it("allows the cross-niche trends focus without a niche", () => {
    expect(
      readLazyReelToolRequest({ focus: "trends", limit: 18, tool: "niche_report" }),
    ).toEqual({
      focus: "trends",
      limit: 18,
      niche: undefined,
      tool: "niche_report",
    });
  });

  it("bounds result counts", () => {
    expect(() =>
      readLazyReelToolRequest({ limit: 21, tool: "study_videos" }),
    ).toThrow("whole number from 1 to 20");
  });

  it("rejects unsupported teardown URLs without fetching them", () => {
    expect(() =>
      readLazyReelToolRequest({
        tool: "teardown",
        video: "https://example.com/private/video",
      }),
    ).toThrow("public TikTok or Instagram post link");
  });

  it("canonicalizes supported public post links", () => {
    expect(
      readLazyReelToolRequest({
        tool: "teardown",
        video: "https://www.tiktok.com/@Creator/video/123?lang=en",
      }),
    ).toMatchObject({
      tool: "teardown",
      video: "https://www.tiktok.com/@creator/video/123",
    });
  });

  it("requires product copy for creative briefs", () => {
    expect(() =>
      readLazyReelToolRequest({ mode: "brief", tool: "make_brief" }),
    ).toThrow("Product is required");
  });

  it("rejects unknown tools", () => {
    expect(() => readLazyReelToolRequest({ tool: "run_pipeline" })).toThrow(
      "supported LazyReel research job",
    );
  });
});
