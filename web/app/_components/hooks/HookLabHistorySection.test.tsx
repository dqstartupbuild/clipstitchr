import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HookLabHistorySection } from "@/app/_components/hooks/HookLabHistorySection";
import type { StitchrHookPlan } from "@/lib/clipstitchr/types/StitchrHookPlan";
import type { StitchrHookVariant } from "@/lib/clipstitchr/types/StitchrHookVariant";

const noop = vi.fn(async () => undefined);

function createHookOption(index: number): StitchrHookVariant {
  return {
    angle: `Angle ${index}`,
    reason: `Reason ${index}`,
    text: `Option ${index}`,
  };
}

function createHookPlan(index: number): StitchrHookPlan {
  return {
    caption: "",
    createdAt: "2026-01-01T00:00:00.000Z",
    hashtags: [],
    hookOptions: [createHookOption(index)],
    id: `hook_plan_${index}`,
    selectedHook: `Hook ${index}`,
    source: "batch_planner",
    status: "planned",
    updatedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("HookLabHistorySection", () => {
  it("paginates hook history", () => {
    const markup = renderToStaticMarkup(
      <HookLabHistorySection
        error={null}
        isLoading={false}
        plans={Array.from({ length: 7 }, (_, index) =>
          createHookPlan(index + 1),
        )}
        productFilterId=""
        products={[]}
        savingPlanId={null}
        searchQuery=""
        onAccept={noop}
        onProductFilterChange={vi.fn()}
        onReject={noop}
        onSelectOption={noop}
      />,
    );

    expect(markup).toContain("Hook 1");
    expect(markup).toContain("Hook 6");
    expect(markup).not.toContain("Hook 7");
    expect(markup).toContain("1-6 of 7");
    expect(markup).toContain("Page 1 of 2");
  });

  it("keeps a batch option list inside a dropdown", () => {
    const plan = createHookPlan(1);
    const markup = renderToStaticMarkup(
      <HookLabHistorySection
        error={null}
        isLoading={false}
        plans={[
          {
            ...plan,
            hookOptions: Array.from({ length: 10 }, (_, index) =>
              createHookOption(index + 1),
            ),
          },
        ]}
        productFilterId=""
        products={[]}
        savingPlanId={null}
        searchQuery=""
        onAccept={noop}
        onProductFilterChange={vi.fn()}
        onReject={noop}
        onSelectOption={noop}
      />,
    );

    expect(markup).toContain("<details");
    expect(markup).toContain("View all 10 hook options");
  });
});
