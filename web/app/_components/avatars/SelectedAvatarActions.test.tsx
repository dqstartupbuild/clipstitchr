import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SelectedAvatarActions } from "@/app/_components/avatars/SelectedAvatarActions";
import type { Avatar } from "@/lib/clipstitchr/types/Avatar";

const reactMocks = vi.hoisted(() => ({
  stateQueue: [] as unknown[],
  stateSetters: [] as ReturnType<typeof vi.fn>[],
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useState: (initialValue: unknown) => {
      const value =
        reactMocks.stateQueue.length > 0
          ? reactMocks.stateQueue.shift()
          : typeof initialValue === "function"
            ? (initialValue as () => unknown)()
            : initialValue;
      const setter = vi.fn();

      reactMocks.stateSetters.push(setter);

      return [value, setter];
    },
  };
});

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

function createProps(overrides: Partial<Parameters<typeof SelectedAvatarActions>[0]> = {}) {
  return {
    avatar: createAvatar(),
    isDefaultAvatar: false,
    isSaving: false,
    onDelete: vi.fn(),
    onRename: vi.fn(),
    onSetDefault: vi.fn(),
    onVoiceChange: vi.fn(),
    onWardrobeStyleChange: vi.fn(),
    photoCount: 2,
    ...overrides,
  };
}

function createSelectChangeEvent(value: string) {
  return {
    currentTarget: { value },
  } as unknown as React.ChangeEvent<HTMLSelectElement>;
}

function createInputChangeEvent(value: string) {
  return {
    currentTarget: { value },
  } as unknown as React.ChangeEvent<HTMLInputElement>;
}

describe("SelectedAvatarActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    reactMocks.stateQueue.length = 0;
    reactMocks.stateSetters.length = 0;
  });

  it("renders nothing without a selected avatar", () => {
    expect(
      renderToStaticMarkup(
        <SelectedAvatarActions
          isSaving={false}
          isDefaultAvatar={false}
          photoCount={0}
          onDelete={vi.fn()}
          onRename={vi.fn()}
          onSetDefault={vi.fn()}
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
        isDefaultAvatar={false}
        isSaving={false}
        photoCount={2}
        onDelete={vi.fn()}
        onRename={vi.fn()}
        onSetDefault={vi.fn()}
        onVoiceChange={vi.fn()}
        onWardrobeStyleChange={vi.fn()}
      />,
    );

    expect(markup).toContain("SelectInput:Outfits:female:false");
    expect(markup).toContain("SelectInput:Voice:zephyr:false");
    expect(markup).toContain("VoicePreview:");
    expect(markup).toContain("IconButton:Rename Nova:false");
    expect(markup).toContain("IconButton:Delete Nova:false");
    expect(markup).toContain("IconButton:Set Nova as default avatar:false");
  });

  it("disables avatar controls while saving", () => {
    const markup = renderToStaticMarkup(
      <SelectedAvatarActions
        avatar={createAvatar()}
        isDefaultAvatar={false}
        isSaving
        photoCount={1}
        onDelete={vi.fn()}
        onRename={vi.fn()}
        onSetDefault={vi.fn()}
        onVoiceChange={vi.fn()}
        onWardrobeStyleChange={vi.fn()}
      />,
    );

    expect(markup).toContain("SelectInput:Outfits:female:true");
    expect(markup).toContain("IconButton:Delete Nova:true");
    expect(markup).toContain("IconButton:Set Nova as default avatar:true");
  });

  it("handles wardrobe, voice, rename, and delete callbacks", async () => {
    const props = createProps();
    const element = SelectedAvatarActions(props);

    if (!React.isValidElement<{ children: React.ReactNode }>(element)) {
      throw new Error("Expected avatar action wrapper.");
    }

    const children = React.Children.toArray(element.props.children);
    const outfitSelect = children[0] as React.ReactElement<{
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
    }>;
    const voiceSelect = children[1] as React.ReactElement<{
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
    }>;
    const renameButton = children[3] as React.ReactElement<{
      onClick: () => void;
    }>;
    const deleteButton = children[4] as React.ReactElement<{
      onClick: () => void;
    }>;
    const defaultButton = children[5] as React.ReactElement<{
      onClick: () => Promise<void>;
    }>;

    await outfitSelect.props.onChange(createSelectChangeEvent("male"));
    await voiceSelect.props.onChange(createSelectChangeEvent("puck"));
    renameButton.props.onClick();

    vi.stubGlobal("window", {
      confirm: vi.fn(() => false),
    });
    deleteButton.props.onClick();
    await Promise.resolve();
    await defaultButton.props.onClick();

    vi.mocked(window.confirm).mockReturnValue(true);
    (props.onDelete as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("delete failed"),
    );
    deleteButton.props.onClick();
    await Promise.resolve();

    expect(props.onWardrobeStyleChange).toHaveBeenCalledWith(
      props.avatar,
      "male",
    );
    expect(props.onVoiceChange).toHaveBeenCalledWith(props.avatar, "puck");
    expect(props.onDelete).toHaveBeenCalledWith(props.avatar);
    expect(props.onSetDefault).toHaveBeenCalledWith(props.avatar);
    expect(reactMocks.stateSetters[5]).toHaveBeenCalledWith("Nova");
    expect(reactMocks.stateSetters[0]).toHaveBeenCalledWith(true);

    vi.unstubAllGlobals();
  });

  it("skips unchanged wardrobe and voice selections", async () => {
    const props = createProps();
    const element = SelectedAvatarActions(props);

    if (!React.isValidElement<{ children: React.ReactNode }>(element)) {
      throw new Error("Expected avatar action wrapper.");
    }

    const children = React.Children.toArray(element.props.children);
    const outfitSelect = children[0] as React.ReactElement<{
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
    }>;
    const voiceSelect = children[1] as React.ReactElement<{
      onChange: (event: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
    }>;

    await outfitSelect.props.onChange(createSelectChangeEvent("female"));
    await voiceSelect.props.onChange(createSelectChangeEvent("zephyr"));

    expect(props.onWardrobeStyleChange).not.toHaveBeenCalled();
    expect(props.onVoiceChange).not.toHaveBeenCalled();
  });

  it("disables the default avatar action for the current default", () => {
    const markup = renderToStaticMarkup(
      <SelectedAvatarActions
        avatar={createAvatar()}
        isDefaultAvatar
        isSaving={false}
        photoCount={2}
        onDelete={vi.fn()}
        onRename={vi.fn()}
        onSetDefault={vi.fn()}
        onVoiceChange={vi.fn()}
        onWardrobeStyleChange={vi.fn()}
      />,
    );

    expect(markup).toContain("IconButton:Nova is the default avatar:true");
  });

  it("handles rename form submission, cancellation, and failures", async () => {
    const props = createProps();

    reactMocks.stateQueue.push(false, false, false, false, false, " Nova Prime ");
    const inactiveElement = SelectedAvatarActions(props);

    if (!React.isValidElement<{ children: React.ReactNode }>(inactiveElement)) {
      throw new Error("Expected avatar action wrapper.");
    }

    const inactiveChildren = React.Children.toArray(
      inactiveElement.props.children,
    );

    await (
      inactiveChildren[0] as React.ReactElement<{
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) => Promise<void>;
      }>
    ).props.onChange(createSelectChangeEvent("female"));

    reactMocks.stateQueue.push(true, false, false, false, false, " Nova Prime ");
    const formElement = SelectedAvatarActions(props);

    if (
      !React.isValidElement<{
        children: React.ReactNode;
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
      }>(formElement)
    ) {
      throw new Error("Expected rename form.");
    }

    const formChildren = React.Children.toArray(formElement.props.children);
    const input = formChildren[1] as React.ReactElement<{
      onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    }>;
    const cancelButton = formChildren[3] as React.ReactElement<{
      onClick: () => void;
    }>;

    input.props.onChange(createInputChangeEvent("Changed"));
    await formElement.props.onSubmit({
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>);
    cancelButton.props.onClick();

    expect(props.onRename).toHaveBeenCalledWith(props.avatar, "Nova Prime");

    reactMocks.stateQueue.push(true, false, false, false, false, " Broken ");
    (props.onRename as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("rename failed"),
    );
    const failingFormElement = SelectedAvatarActions(props);

    if (
      !React.isValidElement<{
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
      }>(failingFormElement)
    ) {
      throw new Error("Expected failing rename form.");
    }

    await failingFormElement.props.onSubmit({
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>);

    reactMocks.stateQueue.push(true, false, false, false, false, "Nova");
    const unchangedFormElement = SelectedAvatarActions(props);

    if (
      !React.isValidElement<{
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
      }>(unchangedFormElement)
    ) {
      throw new Error("Expected unchanged rename form.");
    }

    await unchangedFormElement.props.onSubmit({
      preventDefault: vi.fn(),
    } as unknown as React.FormEvent<HTMLFormElement>);

    expect(props.onRename).toHaveBeenCalledTimes(2);
  });
});
