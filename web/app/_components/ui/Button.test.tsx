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
    expect(markup).toContain("text-text-inverse");
  });

  it("keeps destructive actions in the dashboard tonal palette", () => {
    const markup = renderToStaticMarkup(
      <Button variant="danger">Delete post</Button>,
    );

    expect(markup).toContain("border-accent/40");
    expect(markup).toContain("bg-surface-muted");
    expect(markup).toContain("text-accent-dark");
    expect(markup).not.toContain("red-");
  });
});
