import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addLibraryPackToAccount,
  get,
  list,
  listByIds,
  listGlobalPexelsPack,
  listGlobalPexelsPackSummaries,
  removeFromLibraryPack,
  removeLibraryPack,
  removeLibraryPackFromAccount,
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

function createQueryChain(
  options: {
    collect?: unknown[];
    unique?: unknown;
  } = {},
) {
  const indexQuery = {
    eq: vi.fn(() => indexQuery),
  };
  const chain = {
    collect: vi.fn(async () => options.collect ?? []),
    first: vi.fn(async () => (options.collect ?? [options.unique ?? null])[0]),
    order: vi.fn(() => chain),
    take: vi.fn(async () => options.collect ?? []),
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

function createPackAccount(overrides: Record<string, unknown> = {}) {
  return {
    _id: "pack_account_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    libraryQuery: "desk setup",
    libraryQueryKey: "desk setup",
    ownerId: "owner_123",
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
    const ownedBackground = createBackground({
      libraryQuery: undefined,
      source: "upload",
    });
    const backgrounds = [ownedBackground];
    const backgroundQueryChain = createQueryChain({
      collect: backgrounds,
      unique: ownedBackground,
    });
    const packAccountQueryChain = createQueryChain({ collect: [] });
    const photoExclusionQueryChain = createQueryChain({ collect: [] });
    const ctx = {
      db: {
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprLibraryPackAccounts") {
            return packAccountQueryChain;
          }

          if (tableName === "swiprLibraryPackPhotoExclusions") {
            return photoExclusionQueryChain;
          }

          return backgroundQueryChain;
        }),
      },
    };

    await expect(getHandler(list)(ctx, {})).resolves.toStrictEqual([
      { ...ownedBackground, isOwnedByCurrentUser: true },
    ]);
    await expect(getHandler(get)(ctx, { id: "background_1" })).resolves.toEqual(
      {
        ...ownedBackground,
        isOwnedByCurrentUser: true,
      },
    );
    expect(backgroundQueryChain.withIndex).toHaveBeenCalledWith(
      "by_uploaded_owner_created",
      expect.any(Function),
    );
    expect(backgroundQueryChain.withIndex).toHaveBeenCalledWith(
      "by_background_id",
      expect.any(Function),
    );
  });

  it("lists global Pexels packs and account-added Pexels packs", async () => {
    const backgrounds = [
      createBackground({
        _id: "doc_1",
        id: "background_1",
        libraryQuery: "Desk Setup",
        uploadedByOwnerId: "other_owner",
      }),
      createBackground({
        _id: "doc_2",
        id: "background_2",
        libraryQuery: "Coffee",
        uploadedByOwnerId: "other_owner",
      }),
      createBackground({
        _id: "doc_3",
        id: "background_3",
        source: "upload",
        uploadedByOwnerId: "other_owner",
      }),
    ];
    const backgroundQueryChain = createQueryChain({
      collect: backgrounds,
    });
    backgroundQueryChain.take
      .mockResolvedValueOnce(backgrounds)
      .mockResolvedValueOnce(backgrounds)
      .mockResolvedValueOnce(backgrounds.slice(0, 2));
    const packAccountQueryChain = createQueryChain({
      collect: [createPackAccount({ libraryQueryKey: "desk setup" })],
    });
    const photoExclusionQueryChain = createQueryChain({ collect: [] });
    const ctx = {
      db: {
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprLibraryPackAccounts") {
            return packAccountQueryChain;
          }

          if (tableName === "swiprLibraryPackPhotoExclusions") {
            return photoExclusionQueryChain;
          }

          return backgroundQueryChain;
        }),
      },
    };

    await expect(getHandler(list)(ctx, {})).resolves.toStrictEqual([
      { ...backgrounds[0], isOwnedByCurrentUser: false },
    ]);
  });

  it("lists one compact summary per Pexels pack", async () => {
    const summary = {
      _id: "summary_1",
      covers: [
        {
          backgroundId: "background_1",
          imageObject: {
            contentType: "image/jpeg",
            key: "pexels/background_1.jpg",
            size: 10,
          },
        },
        {
          backgroundId: "background_2",
          imageObject: {
            contentType: "image/jpeg",
            key: "pexels/background_2.jpg",
            size: 10,
          },
        },
      ],
      libraryQuery: "Desk Setup",
      libraryQueryKey: "desk setup",
      photoCount: 12,
      updatedAt: "2026-05-20T00:00:00.000Z",
    };
    const ctx = {
      db: {
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprPexelsPackSummaries") {
            return createQueryChain({ collect: [summary] });
          }

          if (tableName === "swiprLibraryPackAccounts") {
            return createQueryChain({
              collect: [createPackAccount()],
            });
          }

          return createQueryChain({
            collect: [
              {
                backgroundId: "background_1",
                libraryQueryKey: "desk setup",
              },
            ],
          });
        }),
      },
    };

    await expect(
      getHandler(listGlobalPexelsPackSummaries)(ctx, {}),
    ).resolves.toStrictEqual([
      {
        ...summary,
        accountCovers: [summary.covers[1]],
        accountPhotoCount: 11,
        isInAccount: true,
      },
    ]);
  });

  it("reads only account-added Pexels summaries for picker routes", async () => {
    const summary = {
      _id: "summary_1",
      covers: [],
      libraryQuery: "Desk Setup",
      libraryQueryKey: "desk setup",
      photoCount: 12,
      updatedAt: "2026-05-20T00:00:00.000Z",
    };
    const summaryQuery = createQueryChain({ unique: summary });
    const ctx = {
      db: {
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprLibraryPackAccounts") {
            return createQueryChain({
              collect: [createPackAccount()],
            });
          }

          if (tableName === "swiprPexelsPackSummaries") {
            return summaryQuery;
          }

          return createQueryChain();
        }),
      },
    };

    await expect(
      getHandler(listGlobalPexelsPackSummaries)(ctx, {
        accountOnly: true,
      }),
    ).resolves.toStrictEqual([
      {
        ...summary,
        accountCovers: [],
        accountPhotoCount: 12,
        isInAccount: true,
      },
    ]);
    expect(summaryQuery.unique).toHaveBeenCalledOnce();
    expect(summaryQuery.take).not.toHaveBeenCalled();
  });

  it("loads only the selected global Pexels pack on demand", async () => {
    const backgrounds = [
      createBackground({ id: "background_1" }),
      createBackground({ id: "background_2" }),
    ];
    const backgroundQuery = createQueryChain({ collect: backgrounds });
    const ctx = {
      db: {
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprBackgroundCards") {
            return backgroundQuery;
          }

          if (tableName === "swiprLibraryPackAccounts") {
            return createQueryChain({
              collect: [createPackAccount()],
            });
          }

          return createQueryChain({
            collect: [{ backgroundId: "background_1" }],
          });
        }),
      },
    };

    await expect(
      getHandler(listGlobalPexelsPack)(ctx, {
        applyAccountExclusions: true,
        libraryQuery: "Desk Setup",
      }),
    ).resolves.toStrictEqual([
      { ...backgrounds[1], isOwnedByCurrentUser: true },
    ]);
    expect(backgroundQuery.take).toHaveBeenCalledWith(500);
  });

  it("hydrates referenced Swipe backgrounds by id without exposing private uploads", async () => {
    const ownedBackground = createBackground({
      id: "owned_background",
      source: "upload",
      uploadedByOwnerId: "owner_123",
    });
    const sharedPexelsBackground = createBackground({
      id: "pexels_background",
      libraryQuery: "Desk Setup",
      source: "pexels",
      uploadedByOwnerId: "other_owner",
    });
    const privateBackground = createBackground({
      id: "private_background",
      libraryQuery: undefined,
      source: "upload",
      uploadedByOwnerId: "other_owner",
    });
    const backgroundQueries = [
      createQueryChain({ unique: ownedBackground }),
      createQueryChain({ unique: sharedPexelsBackground }),
      createQueryChain({ unique: privateBackground }),
    ];
    const ctx = {
      db: {
        query: vi.fn(() => backgroundQueries.shift() ?? createQueryChain()),
      },
    };

    await expect(
      getHandler(listByIds)(ctx, {
        ids: [
          "owned_background",
          "pexels_background",
          "private_background",
          "owned_background",
          " ",
        ],
      }),
    ).resolves.toStrictEqual([
      { ...ownedBackground, isOwnedByCurrentUser: true },
      { ...sharedPexelsBackground, isOwnedByCurrentUser: false },
    ]);
  });

  it("hides account-removed pack photos from Mine while keeping them global", async () => {
    const backgrounds = [
      createBackground({
        id: "background_1",
        libraryQuery: "Desk Setup",
        uploadedByOwnerId: "other_owner",
      }),
      createBackground({
        id: "background_2",
        libraryQuery: "Desk Setup",
        uploadedByOwnerId: "other_owner",
      }),
    ];
    const backgroundQueryChain = createQueryChain({
      collect: backgrounds,
    });
    const packAccountQueryChain = createQueryChain({
      collect: [createPackAccount({ libraryQueryKey: "desk setup" })],
    });
    const photoExclusionQueryChain = createQueryChain({
      collect: [
        {
          _id: "exclusion_1",
          backgroundId: "background_1",
          createdAt: "2026-05-20T00:00:00.000Z",
          libraryQuery: "Desk Setup",
          libraryQueryKey: "desk setup",
          ownerId: "owner_123",
        },
      ],
    });
    const ctx = {
      db: {
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprLibraryPackAccounts") {
            return packAccountQueryChain;
          }

          if (tableName === "swiprLibraryPackPhotoExclusions") {
            return photoExclusionQueryChain;
          }

          return backgroundQueryChain;
        }),
      },
    };

    await expect(getHandler(list)(ctx, {})).resolves.toStrictEqual([
      { ...backgrounds[1], isOwnedByCurrentUser: false },
    ]);
  });

  it("normalizes and saves a new background", async () => {
    const ctx = {
      db: {
        insert: vi.fn(async () => "doc_1"),
        query: vi.fn(() => createQueryChain()),
      },
    };

    await expect(getHandler(save)(ctx, createSaveArgs())).resolves.toBe(
      "doc_1",
    );
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

  it("adds and removes global Pexels packs for the authenticated account", async () => {
    const backgroundQueryChain = createQueryChain({
      collect: [createBackground({ libraryQuery: "Desk Setup" })],
    });
    const missingPackAccountQueryChain = createQueryChain({ unique: null });
    const existingPackAccountQueryChain = createQueryChain({
      unique: createPackAccount(),
    });
    const emptyPhotoExclusionQueryChain = createQueryChain({ collect: [] });
    const packAccountQueries = [
      missingPackAccountQueryChain,
      existingPackAccountQueryChain,
      existingPackAccountQueryChain,
    ];
    const ctx = {
      db: {
        delete: vi.fn(),
        insert: vi.fn(async () => "pack_account_1"),
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprLibraryPackAccounts") {
            return packAccountQueries.shift() ?? existingPackAccountQueryChain;
          }

          if (tableName === "swiprLibraryPackPhotoExclusions") {
            return emptyPhotoExclusionQueryChain;
          }

          return backgroundQueryChain;
        }),
      },
    };

    await expect(
      getHandler(addLibraryPackToAccount)(ctx, {
        libraryQuery: "desk setup",
      }),
    ).resolves.toEqual({ count: 1, libraryQuery: "Desk Setup" });
    expect(ctx.db.insert).toHaveBeenCalledWith("swiprLibraryPackAccounts", {
      createdAt: expect.any(String),
      libraryQuery: "Desk Setup",
      libraryQueryKey: "desk setup",
      ownerId: "owner_123",
    });

    await expect(
      getHandler(removeLibraryPackFromAccount)(ctx, {
        libraryQuery: "desk setup",
      }),
    ).resolves.toEqual({ count: 1 });
    expect(ctx.db.delete).toHaveBeenCalledWith("pack_account_1");
  });

  it("removes a Swipr photo from the authenticated account pack", async () => {
    const background = createBackground({ uploadedByOwnerId: "other_owner" });
    const backgroundQueryChain = createQueryChain({ unique: background });
    const packAccountQueryChain = createQueryChain({
      unique: createPackAccount(),
    });
    const missingPhotoExclusionQueryChain = createQueryChain({ unique: null });
    const ctx = {
      db: {
        insert: vi.fn(async () => "photo_exclusion_1"),
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprLibraryPackAccounts") {
            return packAccountQueryChain;
          }

          if (tableName === "swiprLibraryPackPhotoExclusions") {
            return missingPhotoExclusionQueryChain;
          }

          return backgroundQueryChain;
        }),
      },
    };

    await expect(
      getHandler(removeFromLibraryPack)(ctx, { id: "background_1" }),
    ).resolves.toEqual(background);
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexMetadataUpdate",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "swiprLibraryPackPhotoExclusions",
      {
        backgroundId: "background_1",
        createdAt: expect.any(String),
        libraryQuery: "desk setup",
        libraryQueryKey: "desk setup",
        ownerId: "owner_123",
      },
    );
  });

  it("rejects Pexels pack renames because packs are shared", async () => {
    const ctx = {
      db: {
        patch: vi.fn(),
        query: vi.fn(),
      },
    };

    await expect(
      getHandler(renameLibraryPack)(ctx, {
        fromLibraryQuery: "desk setup",
        toLibraryQuery: "  Calisthenics  ",
      }),
    ).rejects.toThrow("Pexels packs are shared now and cannot be renamed.");
    expect(mocks.rateLimiter.limit).not.toHaveBeenCalled();
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("removes Pexels packs from the account without deleting shared records", async () => {
    const existingPackAccountQueryChain = createQueryChain({
      unique: createPackAccount(),
    });
    const photoExclusionQueryChain = createQueryChain({
      collect: [
        {
          _id: "exclusion_1",
          backgroundId: "background_1",
          createdAt: "2026-05-20T00:00:00.000Z",
          libraryQuery: "Desk Setup",
          libraryQueryKey: "desk setup",
          ownerId: "owner_123",
        },
      ],
    });
    const ctx = {
      db: {
        delete: vi.fn(),
        query: vi.fn((tableName: string) => {
          if (tableName === "swiprLibraryPackAccounts") {
            return existingPackAccountQueryChain;
          }

          if (tableName === "swiprLibraryPackPhotoExclusions") {
            return photoExclusionQueryChain;
          }

          return createQueryChain();
        }),
      },
    };

    await expect(
      getHandler(removeLibraryPack)(ctx, { libraryQuery: "desk setup" }),
    ).resolves.toEqual({ count: 1 });
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "convexMetadataUpdate",
      {
        key: "owner_123",
        throws: true,
      },
    );
    expect(ctx.db.delete).toHaveBeenCalledWith("pack_account_1");
    expect(ctx.db.delete).toHaveBeenCalledWith("exclusion_1");
    expect(ctx.db.query).not.toHaveBeenCalledWith("swiprBackgrounds");
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
