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
    mediaJobs: {
      listActive: "mediaJobs.listActive",
    },
    providerJobs: {
      listActive: "providerJobs.listActive",
    },
  },
}));

describe("ActiveWorkerJobsBanner", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAuthenticated = true;
    mocks.useQuery.mockReturnValue([]);
  });

  it("skips active job queries until Convex auth is authenticated", () => {
    mocks.isAuthenticated = false;

    expect(renderToStaticMarkup(<ActiveWorkerJobsBanner />)).toBe("");

    expect(mocks.useQuery).toHaveBeenCalledWith("providerJobs.listActive", "skip");
    expect(mocks.useQuery).toHaveBeenCalledWith("mediaJobs.listActive", "skip");
  });

  it("renders active provider and media jobs after authentication", () => {
    mocks.useQuery
      .mockReturnValueOnce([
        {
          id: "provider_1",
          jobType: "manual-swapr",
          stage: "queued",
          status: "queued",
        },
      ])
      .mockReturnValueOnce([
        {
          id: "media_1",
          jobType: "upload-video-analysis",
          stage: "running",
          status: "running",
        },
      ]);

    const markup = renderToStaticMarkup(<ActiveWorkerJobsBanner />);

    expect(mocks.useQuery).toHaveBeenCalledWith("providerJobs.listActive", {});
    expect(mocks.useQuery).toHaveBeenCalledWith("mediaJobs.listActive", {});
    expect(markup).toContain("Background AI work is running");
    expect(markup).toContain("Swapr generation queued");
    expect(markup).toContain("Upload analysis running");
  });
});
