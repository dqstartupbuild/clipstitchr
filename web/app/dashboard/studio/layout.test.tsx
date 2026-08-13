import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StudioBetaLayout from "./layout";

const access = vi.hoisted(() => ({
  assertStudioBetaPageAccess: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess",
  () => access,
);

describe("StudioBetaLayout", () => {
  beforeEach(() => {
    access.assertStudioBetaPageAccess.mockClear();
  });

  it("guards every nested Studio route before rendering its workspace", async () => {
    const element = await StudioBetaLayout({
      children: <section>Nested Studio route</section>,
    });

    expect(access.assertStudioBetaPageAccess).toHaveBeenCalledTimes(1);
    expect(renderToStaticMarkup(element)).toContain("Nested Studio route");
  });
});
