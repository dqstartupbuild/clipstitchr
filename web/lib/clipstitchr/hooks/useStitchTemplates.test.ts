import { beforeEach, describe, expect, it, vi } from "vitest";
import { useStitchTemplates } from "@/lib/clipstitchr/hooks/useStitchTemplates";
import { api } from "@/convex/_generated/api";
import type { Stitch } from "@/lib/clipstitchr/types/Stitch";
import type { StitchTemplate } from "@/lib/clipstitchr/types/StitchTemplate";

const mocks = vi.hoisted(() => ({
  createFromStitchMutation: vi.fn(),
  removeMutation: vi.fn(),
  stateSetter: vi.fn(),
  updateNameMutation: vi.fn(),
  useConvexAuth: vi.fn(),
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock("react", () => ({
  useCallback: (callback: unknown) => callback,
  useMemo: (callback: () => unknown) => callback(),
  useState: (initialValue: unknown) => [
    typeof initialValue === "function"
      ? (initialValue as () => unknown)()
      : initialValue,
    mocks.stateSetter,
  ],
}));

vi.mock("convex/react", () => ({
  useConvexAuth: mocks.useConvexAuth,
  useMutation: mocks.useMutation,
  useQuery: mocks.useQuery,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    stitchTemplates: {
      createFromStitch: {
        createFromStitch: "stitchTemplates.createFromStitch",
      },
      list: {
        list: "stitchTemplates.list",
      },
      remove: {
        remove: "stitchTemplates.remove",
      },
      updateName: {
        updateName: "stitchTemplates.updateName",
      },
    },
  },
}));

vi.mock("@/lib/clipstitchr/utils/createId", () => ({
  createId: () => "template_2",
}));

function createTemplateDocument(
  overrides: Partial<StitchTemplate> = {},
): StitchTemplate {
  return {
    createdAt: "2026-06-15T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 12,
    height: 1920,
    id: "template_1",
    name: "Template",
    sourceStitchId: "stitch_1",
    sourceStitchName: "Launch stitch",
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    updatedAt: "2026-06-15T00:00:00.000Z",
    width: 1080,
    ...overrides,
  };
}

function createStitch(overrides: Partial<Stitch> = {}): Stitch {
  return {
    createdAt: "2026-06-15T00:00:00.000Z",
    demoClipId: "demo_1",
    demoClipName: "Demo",
    duration: 12,
    height: 1920,
    id: "stitch_1",
    name: "Launch stitch",
    ugcClipId: "ugc_1",
    ugcClipName: "UGC",
    width: 1080,
    ...overrides,
  };
}

describe("useStitchTemplates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });
    mocks.useMutation.mockImplementation((mutationId) => {
      if (mutationId === api.stitchTemplates.createFromStitch.createFromStitch) {
        return mocks.createFromStitchMutation;
      }

      if (mutationId === api.stitchTemplates.updateName.updateName) {
        return mocks.updateNameMutation;
      }

      return mocks.removeMutation;
    });
    mocks.useQuery.mockReturnValue([createTemplateDocument()]);
    mocks.createFromStitchMutation.mockResolvedValue(undefined);
    mocks.updateNameMutation.mockResolvedValue(undefined);
    mocks.removeMutation.mockResolvedValue(undefined);
  });

  it("maps template documents and queries only when authenticated", () => {
    const state = useStitchTemplates();

    expect(state.templates).toEqual([
      expect.objectContaining({
        id: "template_1",
        name: "Template",
        sourceStitchId: "stitch_1",
      }),
    ]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.stitchTemplates.list.list,
      { sortOrder: "newest" },
    );
  });

  it("skips template loading while unauthenticated", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });
    mocks.useQuery.mockReturnValue(undefined);

    const state = useStitchTemplates();

    expect(state.templates).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.stitchTemplates.list.list,
      "skip",
    );
  });

  it("skips template loading when the caller only needs mutations", () => {
    mocks.useQuery.mockReturnValue(undefined);

    const state = useStitchTemplates(false);

    expect(state.templates).toEqual([]);
    expect(state.isLoading).toBe(false);
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.stitchTemplates.list.list,
      "skip",
    );
  });

  it("waits while authentication is loading", () => {
    mocks.useConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    });
    mocks.useQuery.mockReturnValue(undefined);

    const state = useStitchTemplates();

    expect(state.isLoading).toBe(true);
    expect(mocks.useQuery).toHaveBeenCalledWith(
      api.stitchTemplates.list.list,
      "skip",
    );
  });

  it("creates, renames, and deletes templates with saving state transitions", async () => {
    const state = useStitchTemplates();

    await expect(state.createTemplateFromStitch(createStitch())).resolves.toBe(
      "template_2",
    );
    await expect(state.renameTemplate("template_1", "Fresh name")).resolves.toBe(
      undefined,
    );
    await expect(state.deleteTemplate("template_1")).resolves.toBeUndefined();

    expect(mocks.createFromStitchMutation).toHaveBeenCalledWith({
      id: "template_2",
      name: "Launch stitch template",
      stitchId: "stitch_1",
    });
    expect(mocks.updateNameMutation).toHaveBeenCalledWith({
      id: "template_1",
      name: "Fresh name",
    });
    expect(mocks.removeMutation).toHaveBeenCalledWith({ id: "template_1" });
    expect(mocks.stateSetter).toHaveBeenCalledWith("stitch_1");
    expect(mocks.stateSetter).toHaveBeenCalledWith("template_1");
    expect(mocks.stateSetter).toHaveBeenCalledWith(null);
  });
});
