import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { StudioClipsTaskDetail } from "@/lib/clipstitchr/types/studioClips/StudioClipsTaskDetail";
import { StudioClipsTaskActions } from "./StudioClipsTaskActions";

const resumableTask = {
  archivedAt: undefined,
  id: "task_1",
  status: "cancelled",
} as StudioClipsTaskDetail;

describe("StudioClipsTaskActions", () => {
  it("keeps resume unavailable while another Product clip job is active", () => {
    const markup = renderToStaticMarkup(
      <StudioClipsTaskActions
        busyAction={null}
        hasActiveProductWork
        onAction={vi.fn()}
        processingAvailable
        task={resumableTask}
      />,
    );

    expect(markup).toContain("disabled");
    expect(markup).toContain(
      "Finish the active clip job before resuming this task.",
    );
    expect(markup).toContain('role="status"');
  });
});
