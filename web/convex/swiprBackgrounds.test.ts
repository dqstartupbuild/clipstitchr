import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  get,
  list,
  removeFromLibraryPack,
  removeLibraryPack,
  renameLibraryPack,
  save,
} from "./swiprBackgrounds";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  getAuthenticatedOwnerId: vi.fn(),
  mutation: vi.fn((definition) => definition),
  query: vi.fn((definition) => definition),
  rateLimiter: {
    limit: vi.fn(),
  },
}));

vi.mock("./_generated/server", () => ({
  mutation: mocks.mutation,
  query: mocks.query,
}));

vi.mock("./auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.getAuthenticatedOwnerId,
}));

vi.mock("./rateLimiter", () => ({
  rateLimiter: mocks.rateLimiter,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createQueryChain(options: {
  collect?: unknown[];
  unique?: unknown;
} = {}) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => options.collect ?? []),
    order: vi.fn(() => chain),
    unique: vi.fn(async () => options.unique ?? null),
    withIndex: vi.fn(
      (_indexName: string, callback?: (q: typeof indexQuery) => void) => {
        callback?.(indexQuery);

        return chain;
      },
    ),
  };

  return chain;
}

function createBackground(overrides: Record<string, unknown> = {}) {
  return {
    _id: "doc_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    details: "Pexels photo: https://pexels.com/photo/101",
    id: "background_1",
    libraryQuery: "desk setup",
    name: "Studio",
    source: "pexels",
    uploadedByOwnerId: "owner_123",
    ...overrides,
  };
}

function createSaveArgs(overrides: Record<string, unknown> = {}) {
  return {
    createdAt: "2026-05-20T00:00:00.000Z",
    description: "  Clean studio  ",
    details: "  Product pedestal  ",
    height: 1920,
    id: "background_1",
    imageObject: {
      contentType: "image/jpeg",
      key: "user_123/swipr-backgrounds/background_1.jpg",
      size: 10,
    },
    libraryQuery: "  desk setup  ",
    mimeType: "image/jpeg",
    name: "  Studio  ",
    pexelsPhotoId: 101,
    size: 10,
    source: "upload",
    tags: ["studio"],
    width: 1080,
    ...overrides,
  };
}

describe("convex swiprBackgrounds", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getAuthenticatedOwnerId.mockResolvedValue("owner_123");
    mocks.rateLimiter.limit.mockResolvedValue(undefined);
  });

  it("lists and gets Swipr backgrounds for authenticated users", async () => {
    const backgrounds = [createBackground()];
    const queryChain = createQueryChain({
      collect: backgrounds,
      unique: createBackground(),
    });
    const ctx = {
      db: {
        query: vi.fn(() => queryChain),
      },
    };

    await expect(getHandler(list)(ctx, {})).resolves.toStrictEqual(backgrounds);
    await expect(getHandler(get)(ctx, { id: "background_1" })).resolves.toEqual(
      createBackground(),
    );
    expect(queryChain.withIndex).toHaveBeenCalledWith("by_created");
    expect(queryChain.withIndex).toHaveBeenCalledWith(
      "by_background_id",
      expect.any(Function),
    );
  });

  it("normalizes and saves a new background", async () => {
    const ctx = {
      db: {
        insert: vi.fn(async () => "doc_1"),
        query: vi.fn(() => createQueryChain()),
      },
    };

    await expect(getHandler(save)(ctx, createSaveArgs())).resolves.toBe("doc_1");
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordSave",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "swiprBackgrounds",
      expect.objectContaining({
        description: "Clean studio",
        details: "Product pedestal",
        libraryQuery: "desk setup",
        name: "Studio",
        pexelsPhotoId: 101,
        uploadedByOwnerId: "owner_123",
      }),
    );
  });

  it("removes a Swipr photo from its Pexels pack", async () => {
    const queryChain = createQueryChain({ unique: createBackground() });
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => queryChain),
      },
    };

    await expect(
      getHandler(removeFromLibraryPack)(ctx, { id: "background_1" }),
    ).resolves.toEqual(createBackground());
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexMetadataUpdate",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.patch).toHaveBeenCalledWith("doc_1", {
      libraryQuery: undefined,
    });
  });

  it("renames matching Pexels packs with normalized query matching", async () => {
    const backgrounds = [
      createBackground({ _id: "doc_1", libraryQuery: "Desk Setup" }),
      createBackground({ _id: "doc_2", id: "background_2", libraryQuery: "desk   setup" }),
      createBackground({ _id: "doc_3", id: "background_3", libraryQuery: "coffee" }),
    ];
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(() => createQueryChain({ collect: backgrounds })),
      },
    };

    await expect(
      getHandler(renameLibraryPack)(ctx, {
        fromLibraryQuery: "desk setup",
        toLibraryQuery: "  Calisthenics  ",
      }),
    ).resolves.toEqual({ count: 2, libraryQuery: "Calisthenics" });
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexMetadataUpdate",
      {
        count: 2,
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.patch).toHaveBeenCalledWith("doc_1", {
      libraryQuery: "Calisthenics",
    });
    expect(ctx.db.patch).toHaveBeenCalledWith("doc_2", {
      libraryQuery: "Calisthenics",
    });
  });

  it("deletes matching Pexels pack records", async () => {
    const backgrounds = [
      createBackground({ _id: "doc_1", libraryQuery: "Desk Setup" }),
      createBackground({ _id: "doc_2", id: "background_2", libraryQuery: "desk setup" }),
      createBackground({ _id: "doc_3", id: "background_3", libraryQuery: "coffee" }),
    ];
    const ctx = {
      db: {
        delete: vi.fn(),
        query: vi.fn(() => createQueryChain({ collect: backgrounds })),
      },
    };

    await expect(
      getHandler(removeLibraryPack)(ctx, { libraryQuery: "desk setup" }),
    ).resolves.toEqual({ count: 2 });
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexRecordDelete",
      {
        count: 2,
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.delete).toHaveBeenCalledWith("doc_1");
    expect(ctx.db.delete).toHaveBeenCalledWith("doc_2");
  });

  it("rejects blank names and duplicate backgrounds before consuming quota", async () => {
    const ctx = {
      db: {
        insert: vi.fn(),
        query: vi.fn(() => createQueryChain()),
      },
    };

    await expect(
      getHandler(save)(ctx, createSaveArgs({ name: " " })),
    ).rejects.toThrow("Background name is required.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();

    ctx.db.query.mockReturnValueOnce(
      createQueryChain({ unique: createBackground() }),
    );
    await expect(getHandler(save)(ctx, createSaveArgs())).rejects.toThrow(
      "Background already exists.",
    );
  });
});
