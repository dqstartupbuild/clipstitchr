import { describe, expect, it } from "vitest";
import { parsePublicToolGateRollout } from "@/lib/clipstitchr/tools/catalog/rollout/parsePublicToolGateRollout";

describe("parsePublicToolGateRollout", () => {
  it("accepts the one approved strict JSON grammar", () => {
    expect(
      parsePublicToolGateRollout(
        JSON.stringify({
          allocationPercent: 25,
          tools: ["app-hook-generator", "app-ugc-ad-brief-template"],
          variant: "hybrid-v1",
        }),
      ),
    ).toEqual({
      allocationPercent: 25,
      tools: ["app-hook-generator", "app-ugc-ad-brief-template"],
      variant: "hybrid-v1",
    });
  });

  it.each([
    undefined,
    "",
    "not-json",
    "null",
    "[]",
    JSON.stringify({
      allocationPercent: 25,
      tools: ["app-hook-generator"],
      variant: "control",
    }),
    JSON.stringify({
      allocationPercent: 25,
      tools: ["not-a-public-tool"],
      variant: "hybrid-v1",
    }),
    JSON.stringify({
      allocationPercent: 25,
      tools: ["app-hook-generator", "app-hook-generator"],
      variant: "hybrid-v1",
    }),
    JSON.stringify({
      allocationPercent: 25.5,
      tools: ["app-hook-generator"],
      variant: "hybrid-v1",
    }),
    JSON.stringify({
      allocationPercent: -1,
      tools: ["app-hook-generator"],
      variant: "hybrid-v1",
    }),
    JSON.stringify({
      allocationPercent: 101,
      tools: ["app-hook-generator"],
      variant: "hybrid-v1",
    }),
    JSON.stringify({
      allocationPercent: 25,
      extra: true,
      tools: ["app-hook-generator"],
      variant: "hybrid-v1",
    }),
  ])("fails closed for malformed or unapproved configuration", (value) => {
    expect(parsePublicToolGateRollout(value)).toBeNull();
  });
});
