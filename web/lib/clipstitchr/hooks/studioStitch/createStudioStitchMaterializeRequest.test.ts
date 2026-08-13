import { describe, expect, it } from "vitest";
import { createStudioStitchMaterializeRequest } from "./createStudioStitchMaterializeRequest";

describe("createStudioStitchMaterializeRequest", () => {
  it("creates the exact Product-scoped materialization body", () => {
    const request = createStudioStitchMaterializeRequest("product_1");

    expect(request).toEqual({
      idempotencyKey: expect.stringMatching(/^materialize_output_/u),
      productId: "product_1",
    });
    expect(Object.keys(request).sort()).toEqual([
      "idempotencyKey",
      "productId",
    ]);
  });
});
