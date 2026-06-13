import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StitchSocialCaptionCopyButton } from "@/app/_components/stitches/StitchSocialCaptionCopyButton";

const mocks = vi.hoisted(() => ({
  buttonProps: [] as Array<{
    children: React.ReactNode;
    disabled?: boolean;
    icon: React.ReactNode;
    onClick?: () => void;
  }>,
  iconButtonProps: [] as Array<{
    disabled?: boolean;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }>,
  refQueue: [] as Array<{ current: ReturnType<typeof setTimeout> | null }>,
  setStateCalls: [] as Array<ReturnType<typeof vi.fn>>,
  stateQueue: [] as unknown[],
  useEffect: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useEffect: mocks.useEffect,
    useRef: (initialValue: ReturnType<typeof setTimeout> | null) =>
      mocks.refQueue.shift() ?? { current: initialValue },
    useState: (initialValue: unknown) => {
      const value = mocks.stateQueue.length
        ? mocks.stateQueue.shift()
        : typeof initialValue === "function"
          ? (initialValue as () => unknown)()
          : initialValue;
      const setState = vi.fn();

      mocks.setStateCalls.push(setState);

      return [value, setState];
    },
  };
});

vi.mock("lucide-react", () => ({
  Check: () => <span data-icon="check" />,
  Copy: () => <span data-icon="copy" />,
}));

vi.mock("@/app/_components/ui/Button", () => ({
  Button: ({
    children,
    disabled,
    icon,
    onClick,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
    icon: React.ReactNode;
    onClick?: () => void;
  }) => {
    mocks.buttonProps.push({ children, disabled, icon, onClick });

    return (
      <button disabled={disabled} type="button">
        {icon}
        {children}
      </button>
    );
  },
}));

vi.mock("@/app/_components/ui/IconButton", () => ({
  IconButton: ({
    disabled,
    icon,
    label,
    onClick,
  }: {
    disabled?: boolean;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
  }) => {
    mocks.iconButtonProps.push({ disabled, icon, label, onClick });

    return (
      <button aria-label={label} disabled={disabled} type="button">
        {icon}
      </button>
    );
  },
}));

async function flushPromises() {
  for (let index = 0; index < 3; index += 1) {
    await Promise.resolve();
  }
}

describe("StitchSocialCaptionCopyButton", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    mocks.buttonProps = [];
    mocks.iconButtonProps = [];
    mocks.refQueue = [];
    mocks.setStateCalls = [];
    mocks.stateQueue = [];
    mocks.useEffect.mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("renders the copied state with a checkmark", () => {
    mocks.stateQueue = [true];

    expect(
      renderToStaticMarkup(
        <StitchSocialCaptionCopyButton socialCaption="Ready caption" />,
      ),
    ).toContain('data-icon="check"');
    expect(mocks.buttonProps[0]?.children).toBe("Copied");
  });

  it("renders the icon copied state with a checkmark label", () => {
    mocks.stateQueue = [true];

    expect(
      renderToStaticMarkup(
        <StitchSocialCaptionCopyButton
          socialCaption="Ready caption"
          variant="icon"
        />,
      ),
    ).toContain('data-icon="check"');
    expect(mocks.iconButtonProps[0]?.label).toBe("Caption copied");
  });

  it("copies the trimmed caption and clears the copied state after a short delay", async () => {
    vi.useFakeTimers();

    const onCopyError = vi.fn();
    const onCopySuccess = vi.fn();
    const writeText = vi.fn(async () => undefined);

    vi.stubGlobal("navigator", { clipboard: { writeText } });

    const button = StitchSocialCaptionCopyButton({
      onCopyError,
      onCopySuccess,
      socialCaption: "  Caption hook\n\n#ugc #demo #win  ",
    }) as {
      props: { onClick: () => void };
    };

    button.props.onClick();
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith("Caption hook\n\n#ugc #demo #win");
    expect(onCopySuccess).toHaveBeenCalledOnce();
    expect(onCopyError).not.toHaveBeenCalled();
    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(true);

    vi.advanceTimersByTime(1500);

    expect(mocks.setStateCalls[0]).toHaveBeenCalledWith(false);
  });
});
