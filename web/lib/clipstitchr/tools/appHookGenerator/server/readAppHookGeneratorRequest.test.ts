import { describe, expect, it } from "vitest";
import { AppHookGeneratorInputError } from "@/lib/clipstitchr/tools/appHookGenerator/server/AppHookGeneratorInputError";
import { readAppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/server/readAppHookGeneratorRequest";

const validRequest = {
  appName: "ClipStitchr",
  audience: "bootstrapped app founders",
  desiredOutcome: "launch more winning ad variations",
  edgeLevel: "punchy",
  problem: "turning product demos into scroll-stopping ads",
  variationIndex: 2,
};

describe("readAppHookGeneratorRequest", () => {
  it("normalizes a valid request", () => {
    expect(
      readAppHookGeneratorRequest({
        ...validRequest,
        appName: "  ClipStitchr  ",
        audience: "bootstrapped\napp founders",
      }),
    ).toEqual(validRequest);
  });

  it.each([
    null,
    [],
    { ...validRequest, appName: "" },
    { ...validRequest, appName: "{{product_name}}" },
    { ...validRequest, edgeLevel: "reckless" },
    { ...validRequest, variationIndex: -1 },
    { ...validRequest, variationIndex: 1.5 },
    { ...validRequest, variationIndex: 101 },
    { ...validRequest, problem: "p".repeat(241) },
    { ...validRequest, unknownField: "not accepted" },
  ])("rejects invalid input %#", (request) => {
    expect(() => readAppHookGeneratorRequest(request)).toThrow(
      AppHookGeneratorInputError,
    );
  });
});
