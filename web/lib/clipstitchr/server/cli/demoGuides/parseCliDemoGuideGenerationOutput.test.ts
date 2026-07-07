import { describe, expect, it } from "vitest";
import { parseCliDemoGuideGenerationOutput } from "@/lib/clipstitchr/server/cli/demoGuides/parseCliDemoGuideGenerationOutput";

function createOutput(steps: unknown[]) {
  return JSON.stringify({
    goal: "Show the upload flow",
    steps,
    title: "Upload walkthrough",
  });
}

describe("parseCliDemoGuideGenerationOutput", () => {
  it("parses fenced valid JSON into label-only steps", () => {
    expect(
      parseCliDemoGuideGenerationOutput(
        `\`\`\`json
${createOutput([
  { label: "Open the dashboard" },
  { label: "Upload the sample clip" },
  { label: "Review the finished demo" },
])}
\`\`\``,
      ),
    ).toEqual({
      goal: "Show the upload flow",
      steps: [
        { label: "Open the dashboard" },
        { label: "Upload the sample clip" },
        { label: "Review the finished demo" },
      ],
      title: "Upload walkthrough",
    });
  });

  it("rejects malformed JSON", () => {
    expect(() => parseCliDemoGuideGenerationOutput("{nope")).toThrow();
  });

  it("rejects too many steps", () => {
    expect(() =>
      parseCliDemoGuideGenerationOutput(
        createOutput(
          Array.from({ length: 9 }, (_, index) => ({
            label: `Step ${index + 1}`,
          })),
        ),
      ),
    ).toThrow("AI guide must have 3-8 steps.");
  });

  it("rejects empty steps", () => {
    expect(() =>
      parseCliDemoGuideGenerationOutput(
        createOutput([
          { label: "Open the dashboard" },
          { label: "" },
          { label: "Review the result" },
        ]),
      ),
    ).toThrow("AI guide step labels must be 1-120 characters.");
  });

  it("rejects duplicate returned IDs", () => {
    expect(() =>
      parseCliDemoGuideGenerationOutput(
        createOutput([
          { id: "step-1", label: "Open the dashboard" },
          { id: "step-1", label: "Upload the sample clip" },
          { id: "step-3", label: "Review the result" },
        ]),
      ),
    ).toThrow("AI guide step IDs must be unique.");
  });

  it("rejects unsafe steps", () => {
    expect(() =>
      parseCliDemoGuideGenerationOutput(
        createOutput([
          { label: "Open the dashboard" },
          { label: "Delete the customer account" },
          { label: "Review the result" },
        ]),
      ),
    ).toThrow("AI guide includes an unsafe step.");
  });

  it("rejects overlong text", () => {
    expect(() =>
      parseCliDemoGuideGenerationOutput(
        createOutput([
          { label: "Open the dashboard" },
          { label: "Upload the sample clip" },
          { label: "a".repeat(121) },
        ]),
      ),
    ).toThrow("AI guide step labels must be 1-120 characters.");
  });
});
