import { describe, expect, it } from "vitest";
import { blogDocumentSchema } from "@/lib/content/blogDocumentSchema";
import { caseStudyDocumentSchema } from "@/lib/content/caseStudyDocumentSchema";

const validDocument = {
  title: "Getting Started",
  seoTitle:
    "Getting Started — Everything You Need to Know to Get Up and Running",
  slug: "getting-started",
  description:
    "Welcome to your new site. This guide walks you through the essentials — from content authoring to deployment — so you can ship your first update with confidence.",
  date: "2026-01-01",
  author: "Editorial Team",
  category: "guides",
  tags: ["getting-started"],
  image: "/og/default.png",
  canonical: "http://localhost:3000/blog/getting-started",
  targetKeyword: "getting started",
  intent: "informational",
  ctaVariant: "primary",
  schemaTypeHints: ["article"],
  content: "## Hello world",
};

describe("blogDocumentSchema", () => {
  it("accepts a valid blog document payload", () => {
    const result = blogDocumentSchema.safeParse(validDocument);

    expect(result.success).toBe(true);
  });

  it("accepts blog documents without authored canonical URLs", () => {
    const documentWithoutCanonical: Partial<typeof validDocument> = {
      ...validDocument,
    };
    delete documentWithoutCanonical.canonical;

    const result = blogDocumentSchema.safeParse(documentWithoutCanonical);

    expect(result.success).toBe(true);
  });

  it("rejects seo titles that are too short", () => {
    const result = blogDocumentSchema.safeParse({
      ...validDocument,
      seoTitle: "Too short",
    });

    expect(result.success).toBe(false);
  });
});

describe("caseStudyDocumentSchema", () => {
  const validCaseStudyDocument = {
    ...validDocument,
    companyName: "Guppy",
    productName: "Guppy",
    metrics: [{ label: "Total views", value: "139K+" }],
    tools: ["ClipStitchr"],
  };

  it("accepts a valid case study document payload", () => {
    const result = caseStudyDocumentSchema.safeParse(validCaseStudyDocument);

    expect(result.success).toBe(true);
  });

  it("requires at least one case study metric", () => {
    const result = caseStudyDocumentSchema.safeParse({
      ...validCaseStudyDocument,
      metrics: [],
    });

    expect(result.success).toBe(false);
  });
});
