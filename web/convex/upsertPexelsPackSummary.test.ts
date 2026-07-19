import { describe, expect, it, vi } from "vitest";
import { upsertPexelsPackSummary } from "./upsertPexelsPackSummary";

function createQueryChain(existingSummary?: Record<string, unknown>) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    unique: vi.fn(async () => existingSummary ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback: (q: typeof indexQuery) => void) => {
        callback(indexQuery);
        return chain;
      },
    ),
  };

  return chain;
}

function createBackground(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-07-19T12:00:00.000Z",
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "pexels/background_1.jpg",
      size: 10,
    },
    libraryQuery: "Desk Setup",
    libraryQueryKey: "desk setup",
    source: "pexels",
    ...overrides,
  };
}

describe("upsertPexelsPackSummary", () => {
  it("creates the first compact summary for a Pexels pack", async () => {
    const ctx = {
      db: {
        insert: vi.fn(async () => "summary_1"),
        query: vi.fn(() => createQueryChain()),
      },
    };

    await expect(
      upsertPexelsPackSummary(ctx as never, createBackground() as never),
    ).resolves.toBe("summary_1");
    expect(ctx.db.insert).toHaveBeenCalledWith("swiprPexelsPackSummaries", {
      covers: [
        {
          backgroundId: "background_1",
          imageObject: {
            contentType: "image/jpeg",
            key: "pexels/background_1.jpg",
            size: 10,
          },
        },
      ],
      libraryQuery: "Desk Setup",
      libraryQueryKey: "desk setup",
      photoCount: 1,
      updatedAt: "2026-07-19T12:00:00.000Z",
    });
  });

  it("increments an existing summary while keeping four covers", async () => {
    const covers = Array.from({ length: 4 }, (_, index) => ({
      backgroundId: `background_${index + 1}`,
      imageObject: {
        contentType: "image/jpeg",
        key: `pexels/background_${index + 1}.jpg`,
        size: 10,
      },
    }));
    const existingSummary = {
      _id: "summary_1",
      covers,
      photoCount: 4,
    };
    const ctx = {
      db: {
        insert: vi.fn(),
        patch: vi.fn(),
        query: vi.fn(() => createQueryChain(existingSummary)),
      },
    };

    await expect(
      upsertPexelsPackSummary(
        ctx as never,
        createBackground({ id: "background_5" }) as never,
      ),
    ).resolves.toBe("summary_1");
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "summary_1",
      expect.objectContaining({
        covers,
        photoCount: 5,
      }),
    );
    expect(ctx.db.insert).not.toHaveBeenCalled();
  });

  it("ignores backgrounds that are not saved Pexels pack photos", async () => {
    const ctx = {
      db: {
        insert: vi.fn(),
        query: vi.fn(),
      },
    };

    await expect(
      upsertPexelsPackSummary(
        ctx as never,
        createBackground({ source: "upload" }) as never,
      ),
    ).resolves.toBeNull();
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
