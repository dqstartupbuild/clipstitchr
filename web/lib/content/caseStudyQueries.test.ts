import { describe, expect, it, vi } from "vitest";

async function importCaseStudyQueries() {
  return import("@/lib/content/caseStudyQueries");
}

describe("content case study queries", () => {
  it("returns published case studies sorted by newest update/date first", async () => {
    const { getPublishedCaseStudies } = await importCaseStudyQueries();
    const caseStudies = getPublishedCaseStudies();

    expect(caseStudies.length).toBeGreaterThan(0);
    expect(caseStudies.every((caseStudy) => !caseStudy.draft)).toBe(true);

    const timestamps = caseStudies.map((caseStudy) =>
      new Date(caseStudy.updated ?? caseStudy.date).getTime(),
    );
    expect(timestamps).toEqual([...timestamps].sort((a, b) => b - a));
  });

  it("finds featured case studies, categories, and case studies by slug", async () => {
    const {
      getCaseStudyBySlug,
      getCaseStudyCategories,
      getFeaturedCaseStudies,
      getPublishedCaseStudies,
    } = await importCaseStudyQueries();
    const caseStudies = getPublishedCaseStudies();
    const firstCaseStudy = caseStudies[0];

    expect(
      getFeaturedCaseStudies().every((caseStudy) => caseStudy.featured),
    ).toBe(true);
    expect(getCaseStudyCategories()).toEqual(
      Array.from(new Set(caseStudies.map((caseStudy) => caseStudy.category))).sort(),
    );

    if (!firstCaseStudy) {
      throw new Error("Expected seeded case study content to exist.");
    }

    expect(getCaseStudyBySlug(firstCaseStudy.slug)?.slug).toBe(
      firstCaseStudy.slug,
    );
    expect(getCaseStudyBySlug("missing-case-study")).toBeUndefined();
  });

  it("filters draft case studies from published results", async () => {
    vi.resetModules();
    vi.doMock("content-collections", () => ({
      allCaseStudies: [
        {
          category: "Fitness app",
          date: "2026-01-01",
          draft: false,
          featured: true,
          slug: "published",
        },
        {
          category: "SaaS",
          date: "2026-01-02",
          draft: true,
          featured: false,
          slug: "draft",
        },
      ],
    }));

    const { getPublishedCaseStudies } = await importCaseStudyQueries();

    expect(getPublishedCaseStudies().map((caseStudy) => caseStudy.slug)).toEqual([
      "published",
    ]);
  });
});
