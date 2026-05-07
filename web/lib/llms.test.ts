import { describe, expect, it } from "vitest";
import { createLlmsTxt } from "@/lib/llms";

describe("createLlmsTxt", () => {
  it("includes the required sections", () => {
    const text = createLlmsTxt();

    expect(text).toContain("## Facts Block");
    expect(text).toContain("## Core Reading Path");
    expect(text).toContain("## Site Context");
  });
});
