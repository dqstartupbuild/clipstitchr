import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LibraryBatchActionBar } from "@/app/_components/dashboard/LibraryBatchActionBar";

describe("LibraryBatchActionBar", () => {
  it("renders a disabled select action when no visible items exist", () => {
    const markup = renderToStaticMarkup(
      <LibraryBatchActionBar
        areAllVisibleItemsSelected={false}
        isDeletingSelected={false}
        isSelecting={false}
        selectedCount={0}
        visibleItemCount={0}
        onClearSelection={vi.fn()}
        onDeleteSelected={vi.fn()}
        onSelectVisible={vi.fn()}
        onStartSelecting={vi.fn()}
        onStopSelecting={vi.fn()}
      />,
    );

    expect(markup).toContain("Select");
    expect(markup).toContain("disabled");
    expect(markup).not.toContain("Delete selected");
  });

  it("renders batch selection controls", () => {
    const markup = renderToStaticMarkup(
      <LibraryBatchActionBar
        areAllVisibleItemsSelected={false}
        isDeletingSelected={false}
        isSelecting
        selectedCount={2}
        visibleItemCount={4}
        onClearSelection={vi.fn()}
        onDeleteSelected={vi.fn()}
        onSelectVisible={vi.fn()}
        onStartSelecting={vi.fn()}
        onStopSelecting={vi.fn()}
      />,
    );

    expect(markup).toContain("2 selected");
    expect(markup).toContain("Select page");
    expect(markup).toContain("Clear");
    expect(markup).toContain("Delete selected");
    expect(markup).toContain("Done");
  });

  it("renders optional bulk queue controls", () => {
    const markup = renderToStaticMarkup(
      <LibraryBatchActionBar
        areAllVisibleItemsSelected={false}
        isDeletingSelected={false}
        isQueueingSelected
        isSelecting
        queueStatusMessage="Reviewing 2 of 4."
        selectedCount={4}
        visibleItemCount={4}
        onClearSelection={vi.fn()}
        onDeleteSelected={vi.fn()}
        onQueueSelected={vi.fn()}
        onSelectVisible={vi.fn()}
        onStartSelecting={vi.fn()}
        onStopSelecting={vi.fn()}
      />,
    );

    expect(markup).toContain("Reviewing...");
    expect(markup).toContain("Reviewing 2 of 4.");
  });
});
