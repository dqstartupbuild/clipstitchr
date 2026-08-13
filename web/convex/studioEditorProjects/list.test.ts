import { beforeEach, describe, expect, it, vi } from "vitest";
import { list } from "./list";

type ConvexFunction = {
  handler: (ctx: never, args: never) => Promise<unknown>;
};
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  access: vi.fn(),
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

function createContext() {
  const document = {
    _id: "doc_1",
    _creationTime: 1,
    ownerId: "owner_1",
    id: "editor_project_1",
    productId: "product_1",
    name: "Launch cut",
    status: "active",
    recordVersion: 1,
    revision: 2,
    snapshotVersion: 1,
    snapshotJson: '{"large":"snapshot"}',
    snapshotByteLength: 20,
    createdAt: "2026-08-12T00:00:00.000Z",
    updatedAt: "2026-08-12T01:00:00.000Z",
  };
  const chain = {
    withIndex: vi.fn(),
    order: vi.fn(),
    take: vi.fn().mockResolvedValue([document]),
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

describe("studioEditorProjects.list", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
  });

  it("uses the active-status index and excludes snapshots from summaries", async () => {
    const { ctx, chain } = createContext();
    const handler = (list as unknown as ConvexFunction).handler;
    const result = await handler(
      ctx as never,
      { productId: "product_1", limit: 1 } as never,
    );
    expect(chain.withIndex).toHaveBeenCalledWith(
      "by_owner_product_status_updated",
      expect.any(Function),
    );
    expect(result).toEqual([
      expect.objectContaining({ id: "editor_project_1", revision: 2 }),
    ]);
    expect((result as unknown[])[0]).not.toHaveProperty("snapshotJson");
  });

  it("uses the all-status index when archived projects are requested", async () => {
    const { ctx, chain } = createContext();
    const handler = (list as unknown as ConvexFunction).handler;
    await handler(
      ctx as never,
      { productId: "product_1", includeArchived: true, limit: 500 } as never,
    );
    expect(chain.withIndex).toHaveBeenCalledWith(
      "by_owner_product_updated",
      expect.any(Function),
    );
    expect(chain.take).toHaveBeenCalledWith(100);
  });
});
