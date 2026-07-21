import { describe, expect, it, vi } from "vitest";
import { hookLibraryPageSize } from "@/lib/clipstitchr/constants/hookLibraryPageSize";
import { listHookLibraryTemplates } from "./listHookLibraryTemplates";

vi.mock("server-only", () => ({}));

describe("listHookLibraryTemplates", () => {
  it("returns one bounded page from the full library", () => {
    const result = listHookLibraryTemplates({ page: 1 });

    expect(result.items).toHaveLength(hookLibraryPageSize);
    expect(result.totalItems).toBeGreaterThan(1_000);
    expect(result.totalPages).toBeGreaterThan(1);
    expect(result.categories).toHaveLength(16);
  });

  it("searches and filters before paginating", () => {
    const result = listHookLibraryTemplates({
      category: "before_after_arc",
      page: 1,
      purpose: "stitchr",
      query: "before",
      risk: "safe",
    });

    expect(result.totalItems).toBeGreaterThan(0);
    expect(
      result.items.every(
        (item) =>
          item.categoryKey === "before_after_arc" &&
          item.purposes.includes("stitchr") &&
          item.riskLevel === "safe",
      ),
    ).toBe(true);
  });

  it("clamps an out-of-range page to the last result page", () => {
    const result = listHookLibraryTemplates({ page: 1_000 });

    expect(result.page).toBe(result.totalPages);
    expect(result.items.length).toBeGreaterThan(0);
  });
});
