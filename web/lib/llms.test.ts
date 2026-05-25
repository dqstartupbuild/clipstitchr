import { describe, expect, it } from "vitest";
import { createLlmsTxt } from "@/lib/llms";

describe("createLlmsTxt", () => {
  it("includes the required sections", () => {
    const text = createLlmsTxt();

    expect(text).toContain("## Facts Block");
    expect(text).toContain("## Core Reading Path");
    expect(text).toContain("## Site Context");
    expect(text).toContain("Stitchr includes a Longr mode");
    expect(text).not.toContain("- /dashboard");
  });
});
