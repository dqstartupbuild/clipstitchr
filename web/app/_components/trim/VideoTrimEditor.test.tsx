import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { VideoTrimEditor } from "@/app/_components/trim/VideoTrimEditor";
import type { VideoTrimRange } from "@/lib/clipstitchr/types/VideoTrimRange";

const mocks = vi.hoisted(() => ({
  buttons: [] as Array<{
    children: React.ReactNode;
    isLoading?: boolean;
    onClick?: () => void | Promise<void>;
  }>,
  setState: vi.fn(),
  sliderProps: null as {
    duration: number;
    id: string;
    onChange: (trimRange: VideoTrimRange) => void;
    value: VideoTrimRange;
  } | null,
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useId: () => "trim-id",
    useState: (initialValue: unknown) => [initialValue, mocks.setState],
  };
});

vi.mock("@/app/_components/trim/VideoTrimRangeSlider", () => ({
  VideoTrimRangeSlider: (props: NonNullable<typeof mocks.sliderProps>) => {
    mocks.sliderProps = props;
    return <div>Slider:{props.id}</div>;
  },
}));

vi.mock("@/app/_components/ui/Button", () => ({
  Button: ({
    children,
    isLoading,
    onClick,
  }: {
    children: React.ReactNode;
    isLoading?: boolean;
    onClick?: () => void | Promise<void>;
  }) => {
    mocks.buttons.push({ children, isLoading, onClick });
    return (
      <button disabled={isLoading} type="button">
        {children}
      </button>
    );
  },
}));

async function flushPromises() {
  for (let index = 0; index < 3; index += 1) {
    await Promise.resolve();
  }
}

describe("VideoTrimEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.buttons = [];
    mocks.setState.mockReset();
    mocks.sliderProps = null;
  });

  it("renders the trim controls and saves a clamped range", async () => {
    const onCancel = vi.fn();
    const onChange = vi.fn();
    const onSave = vi.fn(async () => undefined);
    const value = {
      end: 12,
      start: -2,
    };
    const markup = renderToStaticMarkup(
      <VideoTrimEditor
        duration={10}
        onCancel={onCancel}
        onChange={onChange}
        onSave={onSave}
        saveLabel="Save trim"
        title="UGC trim"
        value={value}
      />,
    );

    mocks.sliderProps?.onChange({ end: 8, start: 1 });
    mocks.buttons[0]?.onClick?.();
    await mocks.buttons[1]?.onClick?.();

    expect(markup).toContain("UGC trim");
    expect(markup).toContain("min-w-0 max-w-full overflow-hidden");
    expect(markup).toContain("flex flex-wrap");
    expect(markup).toContain("Start 00:00");
    expect(markup).toContain("End 00:12");
    expect(markup).toContain("Slider:trim-id");
    expect(mocks.sliderProps).toMatchObject({
      duration: 10,
      id: "trim-id",
      value,
    });
    expect(onChange).toHaveBeenCalledWith({ end: 8, start: 1 });
    expect(onCancel).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalledWith({ end: 10, start: 0 });
    expect(mocks.setState).toHaveBeenCalledWith(true);
    expect(mocks.setState).toHaveBeenCalledWith(false);
  });

  it("resets saving state when save rejects", async () => {
    const onSave = vi.fn(async () => {
      throw new Error("save failed");
    });

    renderToStaticMarkup(
      <VideoTrimEditor
        duration={10}
        onCancel={vi.fn()}
        onChange={vi.fn()}
        onSave={onSave}
        saveLabel="Save trim"
        title="Demo trim"
        value={{ end: 7, start: 2 }}
      />,
    );

    await expect(mocks.buttons[1]?.onClick?.()).rejects.toThrow("save failed");
    await flushPromises();

    expect(onSave).toHaveBeenCalledWith({ end: 7, start: 2 });
    expect(mocks.setState).toHaveBeenLastCalledWith(false);
  });
});
