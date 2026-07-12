import { describe, expect, it, vi } from "vitest";
import { startApifyActorRun } from "@/lib/clipstitchr/server/apify/startApifyActorRun";

describe("startApifyActorRun", () => {
  it("starts asynchronously with one item and a maximum charge", async () => {
    const fetcher = vi.fn(
      async (...args: Parameters<typeof fetch>) => {
        void args;

        return Response.json(
          {
            data: {
              defaultDatasetId: "dataset_123",
              id: "run_123",
              status: "RUNNING",
            },
          },
          { status: 201 },
        );
      },
    );

    await expect(
      startApifyActorRun({
        actorId: "apify/instagram-scraper",
        fetcher: fetcher as unknown as typeof fetch,
        input: { directUrls: ["https://www.instagram.com/reel/ABC/"], maxItems: 50 },
        maxTotalChargeUsd: 0.25,
        token: "secret-token",
      }),
    ).resolves.toEqual({
      defaultDatasetId: "dataset_123",
      id: "run_123",
      status: "RUNNING",
    });

    const requestUrl = new URL(String(fetcher.mock.calls[0]?.[0]));
    const requestInit = fetcher.mock.calls[0]?.[1];

    expect(requestUrl.pathname).toBe("/v2/acts/apify~instagram-scraper/runs");
    expect(requestUrl.searchParams.get("waitForFinish")).toBe("0");
    expect(requestUrl.searchParams.get("timeout")).toBe("180");
    expect(requestUrl.searchParams.get("maxItems")).toBe("1");
    expect(requestUrl.searchParams.get("maxTotalChargeUsd")).toBe("0.25");
    expect(requestInit).toBeDefined();
    expect(JSON.parse(String(requestInit?.body))).toEqual({
      directUrls: ["https://www.instagram.com/reel/ABC/"],
      maxItems: 1,
    });
  });

  it("requires a positive cost cap", async () => {
    await expect(
      startApifyActorRun({
        actorId: "actor/id",
        input: {},
        maxTotalChargeUsd: 0,
        token: "token",
      }),
    ).rejects.toThrow("greater than zero");
  });

  it("rejects malformed actor IDs before a request is made", async () => {
    await expect(
      startApifyActorRun({
        actorId: "actor/id?waitForFinish=120",
        input: {},
        maxTotalChargeUsd: 0.25,
        token: "token",
      }),
    ).rejects.toThrow("actor ID is invalid");
  });
});
