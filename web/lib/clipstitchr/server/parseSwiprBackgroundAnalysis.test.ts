import { describe, expect, it } from "vitest";
import { parseSwiprBackgroundAnalysis } from "@/lib/clipstitchr/server/parseSwiprBackgroundAnalysis";

describe("parseSwiprBackgroundAnalysis", () => {
  it("extracts and normalizes background analysis JSON", () => {
    expect(
      parseSwiprBackgroundAnalysis(
        `Result:\n{"name":" Studio Wall ","tags":["hero","",12,"hero"],"description":" Bright wall ","details":" Detailed notes "}`,
        "background.jpg",
      ),
    ).toEqual({
      description: "Bright wall",
      details: "Detailed notes",
      name: "Studio Wall",
      tags: ["hero"],
    });
  });

  it("falls back when JSON is missing, invalid, or sparse", () => {
    expect(parseSwiprBackgroundAnalysis("No JSON", "my-image.png")).toEqual({
      name: "my-image",
      tags: [],
    });
    expect(parseSwiprBackgroundAnalysis("{bad", "my-image.png")).toEqual({
      name: "my-image",
      tags: [],
    });
    expect(parseSwiprBackgroundAnalysis('{"name":"   "}', "my-image.png")).toEqual(
      {
        name: "my-image",
        tags: [],
      },
    );
  });
});
