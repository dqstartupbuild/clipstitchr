import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SelectedAvatarActions } from "@/app/_components/avatars/SelectedAvatarActions";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";

vi.mock("@/app/_components/clipr/CliprVoicePreviewButton", () => ({
  CliprVoicePreviewButton: ({ voiceName }: { voiceName: string }) =>
    `VoicePreview:${voiceName}`,
}));

vi.mock("@/app/_components/ui/IconButton", () => ({
  IconButton: ({ disabled, label }: { disabled?: boolean; label: string }) =>
    `IconButton:${label}:${Boolean(disabled)}`,
}));

vi.mock("@/app/_components/ui/SelectInput", () => ({
  SelectInput: ({
    disabled,
    label,
    value,
  }: {
    disabled?: boolean;
    label: string;
    value: string;
  }) => `SelectInput:${label}:${value}:${Boolean(disabled)}`,
}));

function createAvatar(): Avatar {
  return {
    cliprVoiceId: "zephyr",
    createdAt: "2026-01-01T00:00:00.000Z",
    id: "avatar_1",
    name: "Nova",
    updatedAt: "2026-01-01T00:00:00.000Z",
    wardrobeStyle: "female",
  };
}

describe("SelectedAvatarActions", () => {
  it("renders nothing without a selected avatar", () => {
    expect(
      renderToStaticMarkup(
        <SelectedAvatarActions
          isSaving={false}
          photoCount={0}
          onDelete={vi.fn()}
          onRename={vi.fn()}
          onVoiceChange={vi.fn()}
          onWardrobeStyleChange={vi.fn()}
        />,
      ),
    ).toBe("");
  });

  it("renders avatar wardrobe, voice, rename, and delete controls", () => {
    const markup = renderToStaticMarkup(
      <SelectedAvatarActions
        avatar={createAvatar()}
        isSaving={false}
        photoCount={2}
        onDelete={vi.fn()}
        onRename={vi.fn()}
        onVoiceChange={vi.fn()}
        onWardrobeStyleChange={vi.fn()}
      />,
    );

    expect(markup).toContain("SelectInput:Outfits:female:false");
    expect(markup).toContain("SelectInput:Voice:zephyr:false");
    expect(markup).toContain("VoicePreview:");
    expect(markup).toContain("IconButton:Rename Nova:false");
    expect(markup).toContain("IconButton:Delete Nova:false");
  });

  it("disables avatar controls while saving", () => {
    const markup = renderToStaticMarkup(
      <SelectedAvatarActions
        avatar={createAvatar()}
        isSaving
        photoCount={1}
        onDelete={vi.fn()}
        onRename={vi.fn()}
        onVoiceChange={vi.fn()}
        onWardrobeStyleChange={vi.fn()}
      />,
    );

    expect(markup).toContain("SelectInput:Outfits:female:true");
    expect(markup).toContain("IconButton:Delete Nova:true");
  });
});
