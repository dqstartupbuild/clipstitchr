import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HookLabIdeaDeleteDialog } from "@/app/_components/hooks/HookLabIdeaDeleteDialog";

describe("HookLabIdeaDeleteDialog", () => {
  it("explains why an active idea cannot be deleted yet", () => {
    const markup = renderToStaticMarkup(
      <HookLabIdeaDeleteDialog
        ideaName="Morning reveal"
        isDeleting={false}
        isWorking
        onClose={vi.fn()}
        onDelete={vi.fn(async () => undefined)}
      />,
    );

    expect(markup).toContain("Hook Lab is still working");
    expect(markup).toContain("Let it finish before deleting this idea");
    expect(markup).toContain("Still working");
    expect(markup).toContain("disabled");
  });
});
