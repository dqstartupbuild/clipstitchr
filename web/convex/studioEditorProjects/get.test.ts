import { beforeEach, describe, expect, it, vi } from "vitest";
import { get } from "./get";

type ConvexFunction = {
  handler: (ctx: never, args: never) => Promise<unknown>;
};
const mocks = vi.hoisted(() => ({
  auth: vi.fn(),
  access: vi.fn(),
  product: vi.fn(),
  getProject: vi.fn(),
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

describe("studioEditorProjects.get", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.auth.mockResolvedValue("owner_1");
  });

  it("returns an owner-safe full snapshot record after Studio and Product gates", async () => {
    mocks.getProject.mockResolvedValue({
      _id: "doc_1",
      _creationTime: 1,
      ownerId: "owner_1",
      id: "editor_project_1",
      productId: "product_1",
      name: "Launch cut",
      status: "archived",
      recordVersion: 1,
      revision: 4,
      snapshotVersion: 1,
      snapshotJson: '{"version":1}',
      snapshotByteLength: 13,
      createdAt: "2026-08-12T00:00:00.000Z",
      updatedAt: "2026-08-12T01:00:00.000Z",
      archivedAt: "2026-08-12T01:00:00.000Z",
    });
    const handler = (get as unknown as ConvexFunction).handler;
    const result = await handler(
      {} as never,
      { id: "editor_project_1", productId: "product_1" } as never,
    );
    expect(result).toEqual({
      id: "editor_project_1",
      productId: "product_1",
      name: "Launch cut",
      status: "archived",
      revision: 4,
      snapshotVersion: 1,
      snapshotJson: '{"version":1}',
      snapshotByteLength: 13,
      createdAt: "2026-08-12T00:00:00.000Z",
      updatedAt: "2026-08-12T01:00:00.000Z",
      archivedAt: "2026-08-12T01:00:00.000Z",
    });
    expect(result).not.toHaveProperty("ownerId");
    expect(mocks.access).toHaveBeenCalledWith({}, "owner_1");
    expect(mocks.product).toHaveBeenCalledWith({}, "owner_1", "product_1");
  });

  it("returns null rather than leaking a missing or cross-owner project", async () => {
    mocks.getProject.mockResolvedValue(null);
    const handler = (get as unknown as ConvexFunction).handler;
    await expect(
      handler({} as never, { id: "missing", productId: "product_1" } as never),
    ).resolves.toBeNull();
  });
});
