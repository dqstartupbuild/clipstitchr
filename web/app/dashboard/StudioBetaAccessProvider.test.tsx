// @vitest-environment jsdom

import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioBetaAccessProvider } from "./StudioBetaAccessProvider";
import { useStudioBetaAccess } from "@/lib/clipstitchr/hooks/useStudioBetaAccess";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const mocks = vi.hoisted(() => ({
  accessState: {
    hasAccess: true,
    isAllowlisted: true,
    isEnabled: true,
    isGloballyEnabled: true,
  },
}));

vi.mock("convex/react", () => ({
  useConvexAuth: () => ({ isAuthenticated: true }),
  useQuery: () => mocks.accessState,
}));
vi.mock("@/convex/_generated/api", () => ({
  api: {
    studioBetaAccess: {
      getCurrentStudioBetaAccessState: {
        getCurrentStudioBetaAccessState: "get-access",
      },
    },
  },
}));

function AccessResult() {
  const access = useStudioBetaAccess();

  return <span>{access.hasAccess ? "granted" : "denied"}</span>;
}

describe("StudioBetaAccessProvider", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("keeps navigation closed when the Next.js runtime switch is off", async () => {
    await act(async () => {
      root.render(
        <StudioBetaAccessProvider isServerEnabled={false}>
          <AccessResult />
        </StudioBetaAccessProvider>,
      );
    });

    expect(container.textContent).toBe("denied");
  });

  it("exposes access only when both server and Convex gates pass", async () => {
    await act(async () => {
      root.render(
        <StudioBetaAccessProvider isServerEnabled>
          <AccessResult />
        </StudioBetaAccessProvider>,
      );
    });

    expect(container.textContent).toBe("granted");
  });
});
