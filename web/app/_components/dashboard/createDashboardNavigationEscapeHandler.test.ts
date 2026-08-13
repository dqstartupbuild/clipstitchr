// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";
import { createDashboardNavigationEscapeHandler } from "@/app/_components/dashboard/createDashboardNavigationEscapeHandler";

describe("createDashboardNavigationEscapeHandler", () => {
  it("closes navigation only for the Escape key", () => {
    const setIsOpen = vi.fn();
    const handleKeyDown = createDashboardNavigationEscapeHandler(setIsOpen);

    handleKeyDown(new KeyboardEvent("keydown", { key: "Enter" }));
    expect(setIsOpen).not.toHaveBeenCalled();

    handleKeyDown(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(setIsOpen).toHaveBeenCalledOnce();
    expect(setIsOpen).toHaveBeenCalledWith(false);
  });
});
