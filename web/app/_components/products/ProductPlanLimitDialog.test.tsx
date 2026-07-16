/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { ProductPlanLimitDialog } from "./ProductPlanLimitDialog";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  container = document.createElement("div");
  document.body.append(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  document.body.replaceChildren();
});

describe("ProductPlanLimitDialog", () => {
  it("explains that a locked product remains saved", () => {
    const markup = renderToStaticMarkup(
      <ProductPlanLimitDialog
        planName="Starter"
        productLimit={1}
        reason={{ kind: "locked", productName: "Bloomin" }}
        onClose={() => undefined}
      />,
    );

    expect(markup).toContain("Bloomin is locked");
    expect(markup).toContain("This product is still saved");
    expect(markup).toContain("/dashboard/settings#plan-and-usage");
    expect(markup).toContain("product-plan-limit-theme");
    expect(markup).toContain("text-text-inverse");
  });

  it("explains why another product cannot be created", () => {
    const markup = renderToStaticMarkup(
      <ProductPlanLimitDialog
        planName="Pro"
        productLimit={3}
        reason={{ kind: "create" }}
        onClose={() => undefined}
      />,
    );

    expect(markup).toContain("You need another product slot");
    expect(markup).toContain("Pro includes 3 products");
  });

  it("moves focus into the dialog and restores the opener after closing", () => {
    const opener = document.createElement("button");
    opener.textContent = "Open product limit message";
    document.body.prepend(opener);
    opener.focus();
    const onClose = vi.fn(() => root.render(null));

    act(() => {
      root.render(
        <ProductPlanLimitDialog
          planName="Starter"
          productLimit={1}
          reason={{ kind: "locked", productName: "Bloomin" }}
          onClose={onClose}
        />,
      );
    });

    const closeButton = container.querySelector<HTMLButtonElement>(
      "button[aria-label='Close product limit message']",
    );

    expect(document.activeElement).toBe(closeButton);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Escape" }),
      );
    });

    expect(onClose).toHaveBeenCalledOnce();
    expect(container.querySelector("[role='dialog']")).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it("contains forward, reverse, and programmatic focus", () => {
    const outsideButton = document.createElement("button");
    outsideButton.textContent = "Outside";
    document.body.prepend(outsideButton);
    outsideButton.focus();

    act(() => {
      root.render(
        <ProductPlanLimitDialog
          planName="Pro"
          productLimit={3}
          reason={{ kind: "create" }}
          onClose={vi.fn()}
        />,
      );
    });

    const closeButton = container.querySelector<HTMLButtonElement>(
      "button[aria-label='Close product limit message']",
    );
    const reviewLink = container.querySelector<HTMLAnchorElement>(
      "a[href='/dashboard/settings#plan-and-usage']",
    );

    expect(closeButton).not.toBeNull();
    expect(reviewLink).not.toBeNull();

    act(() => {
      closeButton?.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          key: "Tab",
          shiftKey: true,
        }),
      );
    });
    expect(document.activeElement).toBe(reviewLink);

    act(() => {
      reviewLink?.dispatchEvent(
        new KeyboardEvent("keydown", { bubbles: true, key: "Tab" }),
      );
    });
    expect(document.activeElement).toBe(closeButton);

    act(() => outsideButton.focus());
    expect(document.activeElement).toBe(closeButton);
  });
});
