import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { StudioClipsCapabilities } from "@/lib/clipstitchr/types/studioClips/StudioClipsCapabilities";
import { StudioClipsHeader } from "./StudioClipsHeader";

describe("StudioClipsHeader", () => {
  it("uses an honest availability label without stale connection copy", () => {
    const capabilities = {
      execution: { state: "unavailable" },
      sources: {
        upload: { state: "available" },
        youtube: { state: "available" },
      },
    } as StudioClipsCapabilities;

    const markup = renderToStaticMarkup(
      <StudioClipsHeader
        capabilities={capabilities}
        productName="Product one"
      />,
    );

    expect(markup).toContain("Unavailable");
    expect(markup).not.toContain("Not connected");
  });
});
