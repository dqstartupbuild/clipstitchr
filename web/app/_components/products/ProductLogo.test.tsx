/** @vitest-environment jsdom */

import { act } from "react";
import { createRoot } from "react-dom/client";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ProductLogo } from "@/app/_components/products/ProductLogo";

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

describe("ProductLogo", () => {
  it("shows the product website icon over the initials fallback", () => {
    const markup = renderToStaticMarkup(
      <ProductLogo
        name="Launch Kit"
        websiteUrl="https://launchkit.example.com/product"
      />,
    );

    expect(markup).toContain("LK");
    expect(markup).toContain(
      'src="https://launchkit.example.com/favicon.ico"',
    );
    expect(markup).toContain('alt=""');
    expect(markup).toContain('referrerPolicy="no-referrer"');
  });

  it("shows initials when no product website is saved", () => {
    const markup = renderToStaticMarkup(<ProductLogo name="Launch Kit" />);

    expect(markup).toContain("LK");
    expect(markup).not.toContain("<img");
  });

  it("reveals the initials fallback when the website icon fails", async () => {
    const container = document.createElement("div");
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ProductLogo
          name="Launch Kit"
          websiteUrl="https://launchkit.example.com/"
        />,
      );
    });

    const image = container.querySelector("img") as HTMLImageElement;

    await act(async () => image.dispatchEvent(new Event("load")));
    expect(image.hidden).toBe(false);

    await act(async () => image.dispatchEvent(new Event("error")));

    expect(image.hidden).toBe(true);
    expect(container.textContent).toContain("LK");

    await act(async () => root.unmount());
  });
});
