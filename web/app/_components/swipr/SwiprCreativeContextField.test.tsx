import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { SwiprCreativeContextField } from "@/app/_components/swipr/SwiprCreativeContextField";
import { SWIPR_CREATIVE_CONTEXT_MAX_LENGTH } from "@/lib/clipstitchr/constants/swiprCreativeContextMaxLength";

describe("SwiprCreativeContextField", () => {
  it("shows plain-language guidance and the bounded context value", () => {
    const markup = renderToStaticMarkup(
      <SwiprCreativeContextField
        value="Focus on adult acne."
        onChange={() => undefined}
      />,
    );

    expect(markup).toContain("Topic or direction");
    expect(markup).toContain("Tell Swipr what the slides should focus on");
    expect(markup).toContain("Focus on adult acne.");
    expect(markup).toContain(`maxLength="${SWIPR_CREATIVE_CONTEXT_MAX_LENGTH}"`);
  });
});
