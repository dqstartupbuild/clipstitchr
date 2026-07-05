import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ActiveWorkerJobsBanner } from "@/app/_components/dashboard/ActiveWorkerJobsBanner";

const mocks = vi.hoisted(() => ({
  isAuthenticated: true,
  useQuery: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({
    isAuthenticated: mocks.isAuthenticated,
    isLoading: !mocks.isAuthenticated,
  }),
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    activeWorkerJobs: {
      summary: "activeWorkerJobs.summary",
    },
  },
}));

describe("ActiveWorkerJobsBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAuthenticated = true;
    mocks.useQuery.mockReturnValue({ jobs: [], totalCount: 0 });
  });

  it("skips active job queries until Convex auth is authenticated", () => {
    mocks.isAuthenticated = false;

    expect(renderToStaticMarkup(<ActiveWorkerJobsBanner />)).toBe("");

    expect(mocks.useQuery).toHaveBeenCalledWith(
      "activeWorkerJobs.summary",
      "skip",
    );
  });

  it("renders active provider and media jobs after authentication", () => {
    mocks.useQuery.mockReturnValue({
      jobs: [
        {
          id: "provider_1",
          jobType: "manual-swapr",
          stage: "queued",
          status: "queued",
        },
        {
          id: "media_1",
          jobType: "upload-video-analysis",
          stage: "running",
          status: "running",
        },
      ],
      totalCount: 2,
    });

    const markup = renderToStaticMarkup(<ActiveWorkerJobsBanner />);

    expect(mocks.useQuery).toHaveBeenCalledWith("activeWorkerJobs.summary", {});
    expect(markup).toContain("Background work is running");
    expect(markup).toContain("Swapr generation queued");
    expect(markup).toContain("Upload analysis running");
    expect(markup).toContain("View jobs");
  });
});
