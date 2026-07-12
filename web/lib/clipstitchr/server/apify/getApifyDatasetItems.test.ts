import { describe, expect, it, vi } from "vitest";
import { getApifyDatasetItems } from "@/lib/clipstitchr/server/apify/getApifyDatasetItems";

describe("getApifyDatasetItems", () => {
  it("requests and returns at most one clean dataset item", async () => {
    const fetcher = vi.fn(
      async (...args: Parameters<typeof fetch>) => {
        void args;

        return Response.json([{ id: 1 }, { id: 2 }]);
      },
    );

    await expect(
      getApifyDatasetItems({
        datasetId: "dataset_123",
        fetcher: fetcher as unknown as typeof fetch,
        token: "secret-token",
      }),
    ).resolves.toEqual([{ id: 1 }]);

    const requestUrl = new URL(String(fetcher.mock.calls[0]?.[0]));

    expect(requestUrl.searchParams.get("limit")).toBe("1");
    expect(requestUrl.searchParams.get("clean")).toBe("true");
  });

  it("rejects non-array output", async () => {
    const fetcher = vi.fn(async () => Response.json({ items: [] }));

    await expect(
      getApifyDatasetItems({
        datasetId: "dataset_123",
        fetcher: fetcher as unknown as typeof fetch,
        token: "secret-token",
      }),
    ).rejects.toThrow("invalid dataset");
  });
});
