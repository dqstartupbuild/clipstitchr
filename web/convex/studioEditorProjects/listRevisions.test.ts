import { beforeEach, describe, expect, it, vi } from "vitest";
import { listRevisions } from "./listRevisions";

type ConvexFunction = {
  handler: (ctx: never, args: never) => Promise<unknown>;
};

const mocks = vi.hoisted(() => ({
  access: vi.fn(),
  auth: vi.fn(),
  getProject: vi.fn(),
  product: vi.fn(),
  query: vi.fn((definition) => definition),
}));

vi.mock("../_generated/server", () => ({ query: mocks.query }));
vi.mock("../auth/getAuthenticatedOwnerId", () => ({
  getAuthenticatedOwnerId: mocks.auth,
}));
vi.mock("../studioBetaAccess/assertStudioBetaAccess", () => ({
  assertStudioBetaAccess: mocks.access,
}));
vi.mock("./assertStudioEditorActiveProduct", () => ({
  assertStudioEditorActiveProduct: mocks.product,
}));
vi.mock("./getStudioEditorProjectForOwnerProduct", () => ({
  getStudioEditorProjectForOwnerProduct: mocks.getProject,
}));

function createContext() {
  const chain = {
    order: vi.fn(),
    take: vi.fn().mockResolvedValue([
      {
        _creationTime: 1,
        _id: "revision_doc",
        createdAt: "2026-08-12T00:00:00.000Z",
        name: "Launch cut",
        operation: "autosave",
        ownerId: "owner_1",
        productId: "product_1",
        projectId: "editor_project_1",
        recordVersion: 1,
        revision: 4,
        snapshotByteLength: 13,
        snapshotJson: '{"version":1}',
        snapshotVersion: 1,
        status: "active",
      },
    ]),
    withIndex: vi.fn(),
  };
  chain.withIndex.mockImplementation((_name, apply) => {
    const index = { eq: vi.fn() };
    index.eq.mockReturnValue(index);
    apply(index);
    return chain;
  });
  chain.order.mockReturnValue(chain);
  return { ctx: { db: { query: vi.fn(() => chain) } }, chain };
}

describe("studioEditorProjects.listRevisions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
    mocks.getProject.mockResolvedValue({ _id: "project_doc" });
  });

  it("lists only the gated owner and Product project history", async () => {
    const { ctx, chain } = createContext();
    const handler = (listRevisions as unknown as ConvexFunction).handler;
    const result = await handler(
      ctx as never,
      { id: "editor_project_1", limit: 500, productId: "product_1" } as never,
    );

    expect(mocks.access).toHaveBeenCalledWith(ctx, "owner_1");
    expect(mocks.product).toHaveBeenCalledWith(ctx, "owner_1", "product_1");
    expect(chain.withIndex).toHaveBeenCalledWith(
      "by_owner_product_project_revision",
      expect.any(Function),
    );
    expect(chain.order).toHaveBeenCalledWith("desc");
    expect(chain.take).toHaveBeenCalledWith(100);
    expect(result).toEqual([
      expect.objectContaining({ projectId: "editor_project_1", revision: 4 }),
    ]);
    expect((result as unknown[])[0]).not.toHaveProperty("ownerId");
  });

  it("does not query revision rows when the project is absent", async () => {
    mocks.getProject.mockResolvedValue(null);
    const { ctx } = createContext();
    const handler = (listRevisions as unknown as ConvexFunction).handler;
    await expect(
      handler(
        ctx as never,
        { id: "missing", productId: "product_1" } as never,
      ),
    ).resolves.toEqual([]);
    expect(ctx.db.query).not.toHaveBeenCalled();
  });
});
