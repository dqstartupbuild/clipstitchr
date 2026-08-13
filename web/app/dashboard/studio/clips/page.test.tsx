import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudioClipsPage from "./page";

const mocks = vi.hoisted(() => ({ assertAccess: vi.fn() }));

vi.mock("@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess", () => ({
  assertStudioBetaPageAccess: mocks.assertAccess,
}));

vi.mock("./StudioClipsPageClient", () => ({
  StudioClipsPageClient: () => <main>Studio Clips client</main>,
}));

describe("StudioClipsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ userId: "owner_1" });
  });

  it("checks Studio access before rendering the Clips workspace", async () => {
    const page = await StudioClipsPage();

    expect(mocks.assertAccess).toHaveBeenCalledTimes(1);
    expect(renderToStaticMarkup(page)).toContain("Studio Clips client");
  });
});
