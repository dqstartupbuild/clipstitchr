import { describe, expect, it } from "vitest";
import manifest from "@/app/manifest";
import { brandAssets } from "@/lib/brandAssets";

describe("web app manifest", () => {
  it("publishes regular and maskable v2 icons", () => {
    const value = manifest();

    expect(value.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: brandAssets.icon192,
          purpose: "any",
        }),
        expect.objectContaining({
          src: brandAssets.maskableIcon512,
          purpose: "maskable",
        }),
      ]),
    );
  });
});
