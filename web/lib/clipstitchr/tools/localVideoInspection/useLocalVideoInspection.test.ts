import { beforeEach, describe, expect, it, vi } from "vitest";
import { useLocalVideoInspection } from "@/lib/clipstitchr/tools/localVideoInspection/useLocalVideoInspection";

const mocks = vi.hoisted(() => ({
  cleanup: null as (() => void) | null,
  controllerRef: { current: null as AbortController | null },
  readLocalVideoInspection: vi.fn(),
  setErrorMessage: vi.fn(),
  setFile: vi.fn(),
  setInspection: vi.fn(),
  setIsInspecting: vi.fn(),
  stateIndex: 0,
  useCallback: vi.fn((callback: unknown) => callback),
  useEffect: vi.fn((effect: () => void | (() => void)) => {
    const cleanup = effect();
    mocks.cleanup = typeof cleanup === "function" ? cleanup : null;
  }),
  useRef: vi.fn(),
  useState: vi.fn(),
}));

vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();

  return {
    ...actual,
    useCallback: mocks.useCallback,
    useEffect: mocks.useEffect,
    useRef: mocks.useRef,
    useState: mocks.useState,
  };
});

vi.mock(
  "@/lib/clipstitchr/tools/localVideoInspection/readLocalVideoInspection",
  () => ({
    readLocalVideoInspection: mocks.readLocalVideoInspection,
  }),
);

describe("useLocalVideoInspection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cleanup = null;
    mocks.controllerRef.current = null;
    mocks.stateIndex = 0;
    mocks.useRef.mockReturnValue(mocks.controllerRef);
    mocks.useState.mockImplementation((initialValue: unknown) => {
      const setters = [
        mocks.setFile,
        mocks.setInspection,
        mocks.setErrorMessage,
        mocks.setIsInspecting,
      ];
      const setter = setters[mocks.stateIndex];
      mocks.stateIndex += 1;
      return [initialValue, setter];
    });
  });

  it("aborts a stale selection and only publishes the latest report", async () => {
    let resolveOld: ((value: { fileName: string }) => void) | undefined;
    let resolveNew: ((value: { fileName: string }) => void) | undefined;
    mocks.readLocalVideoInspection
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveOld = resolve;
          }),
      )
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            resolveNew = resolve;
          }),
      );
    const inspection = useLocalVideoInspection();
    const oldPromise = inspection.inspectFile(new File(["old"], "old.mp4"));
    const oldSignal = mocks.readLocalVideoInspection.mock.calls[0][1] as AbortSignal;
    const newPromise = inspection.inspectFile(new File(["new"], "new.mp4"));

    expect(oldSignal.aborted).toBe(true);

    resolveOld?.({ fileName: "old.mp4" });
    resolveNew?.({ fileName: "new.mp4" });
    await Promise.all([oldPromise, newPromise]);

    expect(mocks.setInspection).not.toHaveBeenCalledWith({
      fileName: "old.mp4",
    });
    expect(mocks.setInspection).toHaveBeenCalledWith({
      fileName: "new.mp4",
    });
  });

  it("aborts active inspection when its owner unmounts", () => {
    useLocalVideoInspection();
    const controller = new AbortController();
    mocks.controllerRef.current = controller;

    mocks.cleanup?.();

    expect(controller.signal.aborted).toBe(true);
  });
});
