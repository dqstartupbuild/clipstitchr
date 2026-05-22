import { describe, expect, it, vi } from "vitest";
import { MusicTrackListItem } from "@/app/_components/music/MusicTrackListItem";
import type { SharedMusicTrack } from "@/lib/clipstitchr/types/SharedMusicTrack";

vi.mock("@/app/_components/music/MusicTrackPreviewButton", () => ({
  MusicTrackPreviewButton: () => ({
    props: { children: "Preview" },
    type: "button",
  }),
}));

function findElements(
  value: unknown,
  predicate: (element: {
    props?: Record<string, unknown>;
    type?: unknown;
  }) => boolean,
): Array<{ props: Record<string, unknown>; type?: unknown }> {
  if (!value || typeof value !== "object") {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((child) => findElements(child, predicate));
  }

  const element = value as {
    props?: { children?: unknown };
    type?: unknown;
  };
  const matches = predicate(
    element as { props?: Record<string, unknown>; type?: unknown },
  )
    ? [element as { props: Record<string, unknown>; type?: unknown }]
    : [];

  return [...matches, ...findElements(element.props?.children, predicate)];
}

function createTrack(overrides: Partial<SharedMusicTrack> = {}): SharedMusicTrack {
  return {
    audioObject: {
      contentType: "audio/mpeg",
      key: "users/user_123/music/track.mp3",
      size: 1234,
    },
    createdAt: "2026-05-20T00:00:00.000Z",
    durationSeconds: 95,
    id: "track_1",
    isOwnedByCurrentUser: true,
    mimeType: "audio/mpeg",
    size: 1234,
    source: "clipr",
    tags: ["ugc", "hook", "bright", "fast", "extra"],
    title: "Hook Track",
    uploadedByOwnerId: "user_123",
    ...overrides,
  };
}

describe("MusicTrackListItem", () => {
  it("renders ownership, duration, and selection action", () => {
    const onSelect = vi.fn();
    const track = createTrack();
    const tree = MusicTrackListItem({
      isSelected: true,
      onSelect,
      track,
    });
    const [button] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "Button",
    );

    expect(findElements(tree, (element) => element.type === "li")).toHaveLength(1);
    expect(button.props.variant).toBe("secondary");
    expect(button.props.children).toBe("Selected");

    (button.props.onClick as () => void)();

    expect(onSelect).toHaveBeenCalledWith(track);
  });

  it("renders a primary select button for unselected shared tracks", () => {
    const tree = MusicTrackListItem({
      isSelected: false,
      onSelect: vi.fn(),
      track: createTrack({
        isOwnedByCurrentUser: false,
        tags: [],
      }),
    });
    const [button] = findElements(
      tree,
      (element) =>
        typeof element.type === "function" && element.type.name === "Button",
    );

    expect(button.props.variant).toBe("primary");
    expect(button.props.children).toBe("Select");
  });
});
