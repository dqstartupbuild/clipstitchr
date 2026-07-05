import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StitchrCallout } from "@/app/_components/dashboard/StitchrCallout";
import { StitchrEmptyState } from "@/app/_components/stitchr/StitchrEmptyState";
import { PhotoAssetDetailsDialog } from "@/app/_components/swapr/PhotoAssetDetailsDialog";
import { SwaprEmptyState } from "@/app/_components/swapr/SwaprEmptyState";
import { PaginationControls } from "@/app/_components/ui/PaginationControls";
import type { PhotoAssetMetadata } from "@/lib/clipstitchr/types/PhotoAssetMetadata";

function createPhoto(): PhotoAssetMetadata {
  return {
    avatarId: "avatar_1",
    createdAt: "2026-05-20T00:00:00.000Z",
    height: 1920,
    id: "photo_1",
    locationDescription: "Studio",
    mimeType: "image/jpeg",
    name: "Avatar Photo",
    originalName: "avatar.jpg",
    outfitDescription: "Blue jacket",
    photoObject: {
      contentType: "image/jpeg",
      key: "users/user_123/photos/photo_1.jpg",
      size: 1234,
    },
    poseDescription: "Pointing",
    size: 1234,
    tags: ["creator", "studio"],
    updatedAt: "2026-05-20T00:00:00.000Z",
    width: 1080,
  };
}

describe("misc UI coverage", () => {
  it("renders Stitchr and Swapr empty states", () => {
    const markup = renderToStaticMarkup(
      <>
        <StitchrCallout />
        <StitchrEmptyState />
        <SwaprEmptyState hasPhotos={false} hasSourceClips={false} />
        <SwaprEmptyState hasPhotos={false} hasSourceClips={true} />
        <SwaprEmptyState hasPhotos={true} hasSourceClips={false} />
      </>,
    );

    expect(markup).toContain("Open Stitchr");
    expect(markup).toContain("Add one Hook/UGC clip and one product demo");
    expect(markup).toContain("No avatars or source videos yet");
    expect(markup).toContain("No avatars yet");
    expect(markup).toContain("No source videos yet");
  });

  it("renders photo details with metadata and fallback photo preview", () => {
    const onClose = vi.fn();
    const markup = renderToStaticMarkup(
      <>
        <PhotoAssetDetailsDialog
          avatarName="Ava"
          imageUrl="blob:photo"
          photo={createPhoto()}
          onClose={onClose}
        />
        <PhotoAssetDetailsDialog
          imageUrl={null}
          photo={createPhoto()}
          onClose={onClose}
        />
      </>,
    );

    expect(markup).toContain("Photo details");
    expect(markup).toContain("Avatar Photo");
    expect(markup).toContain("Blue jacket");
    expect(markup).toContain("Studio");
    expect(markup).toContain("1080 x 1920");
    expect(markup).toContain("Photo");
  });

  it("wires pagination controls", () => {
    const onNext = vi.fn();
    const onPrevious = vi.fn();
    const tree = PaginationControls({
      canGoNext: true,
      canGoPrevious: false,
      currentPage: 2,
      onNext,
      onPrevious,
      totalItems: 42,
      totalPages: 5,
      visibleEnd: 20,
      visibleStart: 11,
    });
    const iconButtons = findElements(
      tree,
      (element) =>
        typeof element.type === "function" &&
        element.type.name === "IconButton",
    );

    expect(renderToStaticMarkup(tree)).toContain("11-20 of 42");
    expect(iconButtons[0].props.disabled).toBe(true);
    expect(iconButtons[1].props.disabled).toBe(false);

    (iconButtons[0].props.onClick as () => void)();
    (iconButtons[1].props.onClick as () => void)();

    expect(onPrevious).toHaveBeenCalledOnce();
    expect(onNext).toHaveBeenCalledOnce();
  });
});

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
