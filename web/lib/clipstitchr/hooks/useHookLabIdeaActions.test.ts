import { beforeEach, describe, expect, it, vi } from "vitest";
import { useHookLabIdeaActions } from "@/lib/clipstitchr/hooks/useHookLabIdeaActions";

const mocks = vi.hoisted(() => ({
  archive: vi.fn(),
  createFromHookOption: vi.fn(),
  createFromStitch: vi.fn(),
  createFromValue: vi.fn(),
  feedback: {
    error: "shared error",
    setError: vi.fn(),
    setStatusMessage: vi.fn(),
    statusMessage: "shared status",
  },
  remove: vi.fn(),
  retry: vi.fn(),
  update: vi.fn(),
  useIdea: vi.fn(),
  useArchiveHookLabIdea: vi.fn(),
  useCreateHookLabIdeaFromHookOption: vi.fn(),
  useCreateHookLabIdeaFromStitchSelection: vi.fn(),
  useCreateHookLabIdeaFromValue: vi.fn(),
  useHookLabIdeaActionFeedback: vi.fn(),
  useRemoveHookLabIdea: vi.fn(),
  useRetryHookLabIdeaAnalysis: vi.fn(),
  useStartHookLabIdeaUseAction: vi.fn(),
  useUpdateHookLabIdea: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/hooks/useArchiveHookLabIdea", () => ({
  useArchiveHookLabIdea: mocks.useArchiveHookLabIdea,
}));

vi.mock(
  "@/lib/clipstitchr/hooks/useCreateHookLabIdeaFromHookOption",
  () => ({
    useCreateHookLabIdeaFromHookOption:
      mocks.useCreateHookLabIdeaFromHookOption,
  }),
);

vi.mock(
  "@/lib/clipstitchr/hooks/useCreateHookLabIdeaFromStitchSelection",
  () => ({
    useCreateHookLabIdeaFromStitchSelection:
      mocks.useCreateHookLabIdeaFromStitchSelection,
  }),
);

vi.mock("@/lib/clipstitchr/hooks/useCreateHookLabIdeaFromValue", () => ({
  useCreateHookLabIdeaFromValue: mocks.useCreateHookLabIdeaFromValue,
}));

vi.mock("@/lib/clipstitchr/hooks/useHookLabIdeaActionFeedback", () => ({
  useHookLabIdeaActionFeedback: mocks.useHookLabIdeaActionFeedback,
}));

vi.mock("@/lib/clipstitchr/hooks/useRemoveHookLabIdea", () => ({
  useRemoveHookLabIdea: mocks.useRemoveHookLabIdea,
}));

vi.mock("@/lib/clipstitchr/hooks/useRetryHookLabIdeaAnalysis", () => ({
  useRetryHookLabIdeaAnalysis: mocks.useRetryHookLabIdeaAnalysis,
}));

vi.mock("@/lib/clipstitchr/hooks/useStartHookLabIdeaUseAction", () => ({
  useStartHookLabIdeaUseAction: mocks.useStartHookLabIdeaUseAction,
}));

vi.mock("@/lib/clipstitchr/hooks/useUpdateHookLabIdea", () => ({
  useUpdateHookLabIdea: mocks.useUpdateHookLabIdea,
}));

describe("useHookLabIdeaActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useHookLabIdeaActionFeedback.mockReturnValue(mocks.feedback);
    mocks.useArchiveHookLabIdea.mockReturnValue({
      archive: mocks.archive,
      archivingIdeaId: "archive_idea",
    });
    mocks.useCreateHookLabIdeaFromHookOption.mockReturnValue({
      createFromHookOption: mocks.createFromHookOption,
      savingIdeaId: "hook_option",
    });
    mocks.useCreateHookLabIdeaFromStitchSelection.mockReturnValue({
      createFromStitch: mocks.createFromStitch,
      isCreating: false,
    });
    mocks.useCreateHookLabIdeaFromValue.mockReturnValue({
      createFromValue: mocks.createFromValue,
      isCreating: true,
    });
    mocks.useRemoveHookLabIdea.mockReturnValue({
      deletingIdeaId: "delete_idea",
      remove: mocks.remove,
    });
    mocks.useRetryHookLabIdeaAnalysis.mockReturnValue({
      retry: mocks.retry,
      retryingIdeaId: "retry_idea",
    });
    mocks.useStartHookLabIdeaUseAction.mockReturnValue({
      currentUseIdsByIdeaId: { idea_1: "use_1" },
      useIdea: mocks.useIdea,
      usingIdeaId: "use_idea",
    });
    mocks.useUpdateHookLabIdea.mockReturnValue({
      savingIdeaId: "update_idea",
      update: mocks.update,
    });
  });

  it("composes the focused actions into the existing public API", () => {
    expect(useHookLabIdeaActions()).toEqual({
      archive: mocks.archive,
      archivingIdeaId: "archive_idea",
      createFromHookOption: mocks.createFromHookOption,
      createFromStitch: mocks.createFromStitch,
      createFromValue: mocks.createFromValue,
      currentUseIdsByIdeaId: { idea_1: "use_1" },
      deletingIdeaId: "delete_idea",
      error: "shared error",
      isCreating: true,
      remove: mocks.remove,
      retry: mocks.retry,
      retryingIdeaId: "retry_idea",
      savingIdeaId: "hook_option",
      statusMessage: "shared status",
      update: mocks.update,
      useIdea: mocks.useIdea,
      usingIdeaId: "use_idea",
    });

    expect(mocks.useArchiveHookLabIdea).toHaveBeenCalledWith(mocks.feedback);
    expect(mocks.useStartHookLabIdeaUseAction).toHaveBeenCalledWith(
      mocks.feedback,
    );
    expect(mocks.useCreateHookLabIdeaFromHookOption).toHaveBeenCalledWith(
      mocks.feedback,
    );
    expect(mocks.useCreateHookLabIdeaFromStitchSelection).toHaveBeenCalledWith(
      mocks.feedback,
    );
    expect(mocks.useCreateHookLabIdeaFromValue).toHaveBeenCalledWith(
      mocks.feedback,
    );
    expect(mocks.useRemoveHookLabIdea).toHaveBeenCalledWith(mocks.feedback);
    expect(mocks.useRetryHookLabIdeaAnalysis).toHaveBeenCalledWith(
      mocks.feedback,
    );
    expect(mocks.useUpdateHookLabIdea).toHaveBeenCalledWith(mocks.feedback);
  });

  it("falls through to update activity when no hook option is being saved", () => {
    mocks.useCreateHookLabIdeaFromHookOption.mockReturnValue({
      createFromHookOption: mocks.createFromHookOption,
      savingIdeaId: null,
    });
    mocks.useCreateHookLabIdeaFromStitchSelection.mockReturnValue({
      createFromStitch: mocks.createFromStitch,
      isCreating: false,
    });
    mocks.useCreateHookLabIdeaFromValue.mockReturnValue({
      createFromValue: mocks.createFromValue,
      isCreating: false,
    });

    const actions = useHookLabIdeaActions();

    expect(actions.savingIdeaId).toBe("update_idea");
    expect(actions.isCreating).toBe(false);
  });
});
