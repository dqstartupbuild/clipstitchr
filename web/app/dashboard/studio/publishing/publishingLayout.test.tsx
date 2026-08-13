import { describe, expect, it, vi } from "vitest";
import PublishingLayout from "@/app/dashboard/studio/publishing/layout";

const access = vi.hoisted(() => ({
  assertStudioBetaPageAccess: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "@/lib/clipstitchr/server/studio/access/assertStudioBetaPageAccess",
  () => access,
);

describe("PublishingLayout", () => {
  it("asserts Studio Beta access before mounting any publishing route", async () => {
    const element = await PublishingLayout({ children: <p>Publishing</p> });

    expect(access.assertStudioBetaPageAccess).toHaveBeenCalledTimes(1);
    expect(element.props.children.type).toBeDefined();
  });
});
