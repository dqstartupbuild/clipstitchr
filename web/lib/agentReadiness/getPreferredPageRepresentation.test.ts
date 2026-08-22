import { describe, expect, it } from "vitest";
import { getPreferredPageRepresentation } from "@/lib/agentReadiness/getPreferredPageRepresentation";

describe("getPreferredPageRepresentation", () => {
  it("honors quality values and client order", () => {
    expect(getPreferredPageRepresentation("text/markdown")).toBe("markdown");
    expect(
      getPreferredPageRepresentation("text/html, text/markdown;q=0.5"),
    ).toBe("html");
    expect(
      getPreferredPageRepresentation("text/markdown, text/html"),
    ).toBe("markdown");
    expect(getPreferredPageRepresentation("*/*")).toBe("html");
  });

  it("uses the most specific range before wildcard quality", () => {
    expect(
      getPreferredPageRepresentation("text/markdown;q=0, text/*;q=1"),
    ).toBe("html");
    expect(
      getPreferredPageRepresentation("text/markdown;q=0, */*;q=1"),
    ).toBe("html");
    expect(
      getPreferredPageRepresentation("text/html;q=0, text/*;q=0.5"),
    ).toBe("markdown");
    expect(
      getPreferredPageRepresentation(
        "text/markdown;q=0, text/html;q=0, */*;q=1",
      ),
    ).toBeNull();
  });

  it("returns null when no available representation is acceptable", () => {
    expect(getPreferredPageRepresentation("application/pdf")).toBeNull();
    expect(
      getPreferredPageRepresentation("text/markdown", ["html"]),
    ).toBeNull();
    expect(
      getPreferredPageRepresentation("text/markdown, text/html;q=0.5", [
        "html",
      ]),
    ).toBe("html");
  });
});
