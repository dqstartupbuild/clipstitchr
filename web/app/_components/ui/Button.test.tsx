import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "@/app/_components/ui/Button";

describe("Button", () => {
  it("exposes loading progress without changing its accessible label", () => {
    const markup = renderToStaticMarkup(<Button isLoading>Opening Stripe</Button>);

    expect(markup).toContain('aria-busy="true"');
    expect(markup).toContain("disabled");
    expect(markup).toContain("Opening Stripe");
  });

  it("omits the busy state while idle", () => {
    const markup = renderToStaticMarkup(<Button>Open Stripe</Button>);

    expect(markup).not.toContain("aria-busy");
  });
});
