import { describe, expect, it } from "vitest";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";
import { createLlmsTxt } from "@/lib/llms";

describe("createLlmsTxt", () => {
  it("includes the required sections", () => {
    const text = createLlmsTxt();

    expect(text).toContain("## Facts Block");
    expect(text).toContain("## Core Reading Path");
    expect(text).toContain("## Site Context");
    expect(text).toContain("Stitchr includes a Longr mode");
    expect(text).toContain("- /tools");
    for (const key of publicToolKeys) {
      expect(text).toContain(`- ${publicToolCatalog[key].pathname}`);
    }
    expect(text).toContain(
      "Free app marketing tools for hooks, briefs, creative tests, production costs, and app-demo checks",
    );
    expect(text).not.toContain("- /dashboard");
  });
});
