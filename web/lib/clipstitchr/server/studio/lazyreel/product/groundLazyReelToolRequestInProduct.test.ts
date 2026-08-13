import { describe, expect, it } from "vitest";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";
import { groundLazyReelToolRequestInProduct } from "./groundLazyReelToolRequestInProduct";

const product: ProductProfile = {
  audienceDetails: "Busy runners who train before work",
  createdAt: "2026-08-12T00:00:00.000Z",
  id: "product_123",
  inferredPainPoints: ["Heavy shoes", "Wet socks"],
  name: "Trail Light",
  productDetails: "A lightweight trail shoe with a grippy outsole.",
  updatedAt: "2026-08-12T00:00:00.000Z",
};

describe("groundLazyReelToolRequestInProduct", () => {
  it("replaces browser-supplied product claims with the saved Product", () => {
    const grounded = groundLazyReelToolRequestInProduct(
      {
        audience: "",
        product: "Invented browser claim",
        tool: "make_brief",
      },
      product,
    );

    expect(grounded).toMatchObject({
      audience: "Busy runners who train before work",
      tool: "make_brief",
    });
    expect((grounded as { product: string }).product).toContain(
      "Product name: Trail Light",
    );
    expect((grounded as { product: string }).product).not.toContain(
      "Invented browser claim",
    );
  });

  it("grounds product-mode teardowns without changing video teardowns", () => {
    expect(
      groundLazyReelToolRequestInProduct(
        { product: "browser", tool: "teardown" },
        product,
      ),
    ).toMatchObject({ product: expect.stringContaining("Trail Light") });

    const videoRequest = {
      tool: "teardown" as const,
      video: "A creator opens on a muddy shoe.",
    };

    expect(groundLazyReelToolRequestInProduct(videoRequest, product)).toBe(
      videoRequest,
    );
  });
});
