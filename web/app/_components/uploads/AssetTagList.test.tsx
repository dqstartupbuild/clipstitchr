import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AssetTagList } from "@/app/_components/uploads/AssetTagList";

describe("AssetTagList", () => {
  it("normalizes, prioritizes required tags, and summarizes hidden tags", () => {
    const markup = renderToStaticMarkup(
      <AssetTagList
        maxVisible={2}
        requiredTag="UGC"
        tags={["Demo", "B Roll", "Extra", "Fifth"]}
      />,
    );

    expect(markup).toContain("ugc");
    expect(markup).toContain("demo");
    expect(markup).toContain("+3");
  });

  it("renders nothing when there are no normalized tags", () => {
    expect(renderToStaticMarkup(<AssetTagList tags={["   ", "#"]} />)).toBe("");
  });
});
