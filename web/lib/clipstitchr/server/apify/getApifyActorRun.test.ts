import { describe, expect, it, vi } from "vitest";
import { getApifyActorRun } from "@/lib/clipstitchr/server/apify/getApifyActorRun";

describe("getApifyActorRun", () => {
  it("reads durable run and dataset state", async () => {
    const fetcher = vi.fn(
      async (...args: Parameters<typeof fetch>) => {
        void args;

        return Response.json({
          data: {
            defaultDatasetId: "dataset_123",
            finishedAt: "2026-07-12T10:00:00.000Z",
            id: "run_123",
            status: "SUCCEEDED",
          },
        });
      },
    );

    await expect(
      getApifyActorRun({
        fetcher: fetcher as unknown as typeof fetch,
        runId: "run_123",
        token: "secret-token",
      }),
    ).resolves.toEqual({
      defaultDatasetId: "dataset_123",
      finishedAt: "2026-07-12T10:00:00.000Z",
      id: "run_123",
      status: "SUCCEEDED",
    });

    expect(String(fetcher.mock.calls[0]?.[0])).toContain("/actor-runs/run_123");
  });

  it("rejects malformed run output", async () => {
    const fetcher = vi.fn(async () => Response.json({ data: { status: "NOPE" } }));

    await expect(
      getApifyActorRun({
        fetcher: fetcher as unknown as typeof fetch,
        runId: "run_123",
        token: "secret-token",
      }),
    ).rejects.toThrow("invalid Actor run");
  });
});
