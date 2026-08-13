import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { StudioBetaWorkspaceNavigation } from "@/app/_components/studio/StudioBetaWorkspaceNavigation";

describe("StudioBetaWorkspaceNavigation", () => {
  it("links every working Studio task and marks the current task", () => {
    const html = renderToStaticMarkup(
      <StudioBetaWorkspaceNavigation current="cut-room" />,
    );

    expect(html).toContain('aria-label="Studio workspace"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain("/dashboard/studio/research");
    expect(html).toContain("/dashboard/studio/clips");
    expect(html).toContain("/dashboard/studio/stitch");
    expect(html).toContain("/dashboard/studio/edit");
    expect(html).toContain("/dashboard/studio/publishing");
    expect(html).toContain("/dashboard/library");
  });
});
