import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelectableClipCard } from "@/app/_components/stitchr/SelectableClipCard";
import type { MediaCardActionMenuItem } from "@/app/_components/ui/MediaCardActionMenu";
import type { QuickEditRemoveRange } from "@/lib/clipstitchr/types/QuickEditRemoveRange";
import type { VideoClip } from "@/lib/clipstitchr/types/VideoClip";
import type { VideoClipMetadata } from "@/lib/clipstitchr/types/VideoClipMetadata";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

const mocks = vi.hoisted(() => ({
  actionItems: [] as MediaCardActionMenuItem[],
  cutEditor: null as null | {
    initialRemoveRanges: QuickEditRemoveRange[];
    onSave: (removeRanges: QuickEditRemoveRange[]) => void | Promise<void>;
  },
  openDetails: vi.fn(),
  trimEditor: null as null | {
    initialTrimRange: VideoTrimRange;
    onSave: (trimRange: VideoTrimRange) => void | Promise<void>;
  },
}));

vi.mock("@/app/_components/dashboard/VideoClipPreviewCard", () => ({
  VideoClipPreviewCard: ({
    actions,
    cutEditor,
    trimEditor,
  }: {
    actions: (input: {
      closeDetails: () => void;
      isLoading: boolean;
      loadFullClip: () => Promise<VideoClip | null>;
      openDetails: (options?: unknown) => void;
    }) => MediaCardActionMenuItem[];
    cutEditor?: typeof mocks.cutEditor;
    trimEditor?: typeof mocks.trimEditor;
  }) => {
    mocks.cutEditor = cutEditor ?? null;
    mocks.trimEditor = trimEditor ?? null;
    mocks.actionItems = actions({
      closeDetails: vi.fn(),
      isLoading: false,
      loadFullClip: vi.fn(),
      openDetails: mocks.openDetails,
    });

    return "VideoClipPreviewCard";
  },
}));

function createClip(
  overrides: Partial<VideoClipMetadata> = {},
): VideoClipMetadata {
  return {
    aspectRatio: 9 / 16,
    clipType: "demo",
    createdAt: "2026-05-20T00:00:00.000Z",
    duration: 10,
    hasAudio: true,
    height: 1920,
    id: "demo_1",
    mimeType: "video/mp4",
    name: "Demo clip",
    originalName: "demo.mp4",
    originalSize: 100,
    size: 100,
    sourceMimeType: "video/mp4",
    tags: ["demo"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    videoObject: {
      contentType: "video/mp4",
      key: "demo.mp4",
      size: 100,
    },
    width: 1080,
    ...overrides,
  };
}

describe("SelectableClipCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.actionItems = [];
    mocks.cutEditor = null;
    mocks.trimEditor = null;
  });

  it("opens candidate-only demo suggestions in selected cut controls", () => {
    const candidate = {
      start: 2,
      end: 6,
      confidence: 0.82,
      signals: ["static-frame" as const],
      reason: "The demo stays on the same screen.",
    };
    const onUpdateCuts = vi.fn();

    const markup = renderToStaticMarkup(
      <SelectableClipCard
        clip={createClip({
          performanceScore: {
            bestUse: "Use after the opener",
            fixes: ["Cut the slow screen"],
            overall: 80,
            quickEditSuggestions: {
              candidates: [candidate],
              removeRanges: [],
            },
            strengths: ["Clear proof"],
            summary: "Useful demo.",
          },
        })}
        isSelected
        onLoadClip={vi.fn()}
        onSelect={vi.fn()}
        onUpdateCuts={onUpdateCuts}
        onUpdateTrim={vi.fn()}
        trimRange={{ start: 0, end: 10 }}
      />,
    );

    expect(markup).toContain("VideoClipPreviewCard");
    expect(mocks.actionItems.map((item) => item.label)).toContain(
      "Review AI cuts",
    );
    expect(mocks.cutEditor?.initialRemoveRanges).toEqual([
      {
        start: candidate.start,
        end: candidate.end,
        reason: candidate.reason,
      },
    ]);

    mocks.actionItems.find((item) => item.label === "Review AI cuts")?.onClick?.();

    expect(mocks.openDetails).toHaveBeenCalledWith({
      showControlsEditor: true,
    });
  });
});
