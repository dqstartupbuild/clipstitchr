import { describe, expect, it } from "vitest";
import { slugifyHeadingText } from "./slugifyHeadingText";

describe("slugifyHeadingText", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugifyHeadingText("My Heading")).toBe("my-heading");
  });

  it("removes punctuation and special characters", () => {
    expect(slugifyHeadingText("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple dashes", () => {
    expect(slugifyHeadingText("Hello --- World")).toBe("hello-world");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugifyHeadingText("---Hello---")).toBe("hello");
  });

  it("strips html tags before slugifying", () => {
    expect(slugifyHeadingText("Hello <strong>World</strong>")).toBe(
      "hello-world",
    );
  });

  it("decodes basic html entities before slugifying", () => {
    expect(slugifyHeadingText("Q&amp;A: Getting Started")).toBe(
      "qa-getting-started",
    );
  });

  it("removes diacritics", () => {
    expect(slugifyHeadingText("Café & Résumé")).toBe("cafe-resume");
  });

  it("returns an empty string when input has no slug-safe characters", () => {
    expect(slugifyHeadingText("---")).toBe("");
  });
});