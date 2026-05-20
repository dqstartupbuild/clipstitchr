import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { AssetMetadataEditDialog } from "@/app/_components/uploads/AssetMetadataEditDialog";
import type { ProductProfile } from "@/lib/clipstitchr/types/ProductProfile";

function createProduct(): ProductProfile {
  return {
    audienceDetails: "Creators",
    createdAt: "2026-05-20T00:00:00.000Z",
    id: "product_1",
    inferredPainPoints: [],
    name: "Launch Kit",
    productDetails: "A launch kit",
    updatedAt: "2026-05-20T00:00:00.000Z",
  };
}

describe("AssetMetadataEditDialog", () => {
  it("renders all optional metadata fields for video assets", () => {
    const markup = renderToStaticMarkup(
      <AssetMetadataEditDialog
        title="Edit clip"
        initialName="UGC clip"
        initialDescription="Avatar"
        descriptionLabel="Avatar description"
        descriptionHelp="Describe the avatar"
        initialLocationDescription="Studio"
        initialMainPersonDescription="Creator"
        initialOutfitDescription="Blue jacket"
        initialPoseDescription="Pointing"
        initialProductDescription="Product demo"
        initialProductId="product_1"
        initialTags={["ugc", "demo"]}
        initialVideoDescription="Talking head"
        products={[createProduct()]}
        requiredTag="ugc"
        showMainPersonDescriptionFields
        showPhotoDescriptionFields
        showProductDescriptionField
        showVideoDescriptionFields
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(markup).toContain("Edit clip");
    expect(markup).toContain("Avatar description");
    expect(markup).toContain("Outfit description");
    expect(markup).toContain("Product description");
    expect(markup).toContain("Demo action description");
    expect(markup).toContain("Launch Kit");
    expect(markup).toContain("Save details");
  });

  it("renders the compact photo/details variant", () => {
    const markup = renderToStaticMarkup(
      <AssetMetadataEditDialog
        title="Edit photo"
        initialName="Avatar photo"
        initialTags={[]}
        showPhotoDescriptionFields
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    );

    expect(markup).toContain("Edit photo");
    expect(markup).toContain("Pose description");
    expect(markup).not.toContain("Product description");
  });
});
