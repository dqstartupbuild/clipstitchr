import { describe, expect, it } from "vitest";
import type { AppHookGeneratorRequest } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorRequest";
import { createAppHookGeneratorHooks } from "@/lib/clipstitchr/tools/appHookGenerator/server/createAppHookGeneratorHooks";
import { curatedAppHookTemplateIds } from "@/lib/clipstitchr/tools/appHookGenerator/server/curatedAppHookTemplateIds";

const baseInput: AppHookGeneratorRequest = {
  appName: "ClipStitchr",
  audience: "bootstrapped app founders",
  desiredOutcome: "launch more winning ad variations",
  edgeLevel: "punchy",
  problem: "turning product demos into scroll-stopping ads",
  variationIndex: 0,
};

describe("createAppHookGeneratorHooks", () => {
  it("keeps the curated edge-level pools disjoint", () => {
    const allTemplateIds = Object.values(curatedAppHookTemplateIds).flat();

    expect(new Set(allTemplateIds).size).toBe(allTemplateIds.length);
  });

  it("creates the same eight distinct hooks for the same input", () => {
    const first = createAppHookGeneratorHooks(baseInput);
    const second = createAppHookGeneratorHooks(baseInput);

    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    expect(new Set(first.map((hook) => hook.text.toLowerCase())).size).toBe(8);
  });

  it.each(["safe", "punchy", "bold"] as const)(
    "returns resolved, claim-safe public fields for %s output",
    (edgeLevel) => {
      for (const variationIndex of [0, 1, 37, 100]) {
        const hooks = createAppHookGeneratorHooks({
          ...baseInput,
          edgeLevel,
          variationIndex,
        });

        expect(hooks).toHaveLength(8);

        for (const hook of hooks) {
          expect(Object.keys(hook).sort()).toEqual(["angle", "reason", "text"]);
          expect(hook.text).not.toMatch(/{{|}}/);
          expect(hook.text).not.toMatch(
            /\b(?:100%|case study|customers? say|limited time|users? hit)\b/i,
          );
          expect(hook.text).not.toMatch(/\$\d|\d+%/);
          expect(hook.text).not.toMatch(/\ba bootstrapped app founders\b/i);
          expect(hook.text).toMatch(/^[A-Z0-9]/);
          expect(hook.text.length).toBeGreaterThan(5);
          expect(hook.text.length).toBeLessThanOrEqual(220);
        }
      }
    },
  );

  it("uses the variation index to produce another deterministic set", () => {
    const first = createAppHookGeneratorHooks(baseInput);
    const next = createAppHookGeneratorHooks({
      ...baseInput,
      variationIndex: 1,
    });

    expect(next).not.toEqual(first);
    expect(
      createAppHookGeneratorHooks({ ...baseInput, variationIndex: 1 }),
    ).toEqual(next);
  });

  it.each([
    {
      appName: "PulsePath",
      audience: "people managing high blood pressure",
      desiredOutcome: "a calmer care routine",
      problem: "keeping up with a care routine",
    },
    {
      appName: "NestEgg",
      audience: "first-time investors",
      desiredOutcome: "reliable investment planning",
      problem: "choosing where to invest",
    },
  ])("does not add efficacy promises for sensitive app categories", (input) => {
    for (const edgeLevel of ["safe", "punchy", "bold"] as const) {
      const hooks = createAppHookGeneratorHooks({
        ...input,
        edgeLevel,
        variationIndex: 0,
      });

      for (const hook of hooks) {
        expect(hook.text).not.toMatch(
          /\b(?:cures?|fixes?|guarantee(?:d|s)?|off-switch|solution|does it for you|handles it|heavy lift)\b/i,
        );
      }
    }
  });

  it.each(["safe", "punchy", "bold"] as const)(
    "keeps %s results varied across more than one angle",
    (edgeLevel) => {
      const hooks = createAppHookGeneratorHooks({ ...baseInput, edgeLevel });

      expect(new Set(hooks.map((hook) => hook.angle)).size).toBeGreaterThan(1);
    },
  );
});
