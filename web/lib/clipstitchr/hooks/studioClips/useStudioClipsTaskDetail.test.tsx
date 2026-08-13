// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioClipsTaskDetailHookHarness } from "./StudioClipsTaskDetailHookHarness";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
  connectionCount: 1,
  isConnected: true,
  query: vi.fn(),
  reserve: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  useConvexConnectionState: () => ({
    connectionCount: mocks.connectionCount,
    connectionRetries: 0,
    hasEverConnected: true,
    hasInflightRequests: false,
    inflightActions: 0,
    inflightMutations: 0,
    isWebSocketConnected: mocks.isConnected,
    timeOfOldestInflightRequest: null,
  }),
  useMutation: () => mocks.reserve,
  useQuery: (...args: unknown[]) => mocks.query(...args),
}));

describe("useStudioClipsTaskDetail", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    mocks.connectionCount = 1;
    mocks.isConnected = true;
    mocks.query.mockReturnValue(undefined);
    mocks.reserve.mockResolvedValue({ reserved: true });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    document.body.replaceChildren();
    vi.clearAllMocks();
  });

  it("reserves once before opening the live owned-task query", async () => {
    await act(async () => {
      root.render(<StudioClipsTaskDetailHookHarness taskId="task_1" />);
    });

    expect(mocks.reserve).toHaveBeenCalledOnce();
    expect(mocks.reserve).toHaveBeenCalledWith({ productId: "product_1" });
    expect(mocks.query).toHaveBeenLastCalledWith(
      expect.anything(),
      { id: "task_1", productId: "product_1" },
    );

    await act(async () => {
      root.render(<StudioClipsTaskDetailHookHarness taskId="task_1" />);
    });

    expect(mocks.reserve).toHaveBeenCalledOnce();
  });

  it("reserves again after a real connection count change", async () => {
    await act(async () => {
      root.render(<StudioClipsTaskDetailHookHarness taskId="task_1" />);
    });

    mocks.isConnected = false;
    await act(async () => {
      root.render(<StudioClipsTaskDetailHookHarness taskId="task_1" />);
    });

    expect(mocks.query).toHaveBeenLastCalledWith(expect.anything(), "skip");

    mocks.connectionCount = 2;
    mocks.isConnected = true;
    await act(async () => {
      root.render(<StudioClipsTaskDetailHookHarness taskId="task_1" />);
    });

    expect(mocks.reserve).toHaveBeenCalledTimes(2);
  });
});
