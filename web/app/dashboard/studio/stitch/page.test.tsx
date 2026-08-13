import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudioStitchPage from "./page";

const mocks = vi.hoisted(() => ({ assertAccess: vi.fn() }));

vi.mock("@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess", () => ({
  assertStudioBetaPageAccess: mocks.assertAccess,
}));

vi.mock("./StudioStitchPageClient", () => ({
  StudioStitchPageClient: () => <main>Studio Stitch client</main>,
}));

describe("StudioStitchPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ userId: "owner_1" });
  });

  it("checks Studio access before rendering the Stitch workspace", async () => {
    const page = await StudioStitchPage();

    expect(mocks.assertAccess).toHaveBeenCalledTimes(1);
    expect(renderToStaticMarkup(page)).toContain("Studio Stitch client");
  });
});
