import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudioEditorPage from "./page";

const mocks = vi.hoisted(() => ({
  assertAccess: vi.fn(),
}));

vi.mock("@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess", () => ({
  assertStudioBetaPageAccess: mocks.assertAccess,
}));

vi.mock("@/app/dashboard/studio/edit/StudioEditorPageClient", () => ({
  StudioEditorPageClient: () => <main>Studio editor client</main>,
}));

describe("StudioEditorPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.assertAccess.mockResolvedValue({ allowed: true });
  });

  it("checks Studio access before rendering the App Router editor shell", async () => {
    const page = await StudioEditorPage();

    expect(mocks.assertAccess).toHaveBeenCalledTimes(1);
    expect(renderToStaticMarkup(page)).toContain("Studio editor client");
  });
});
