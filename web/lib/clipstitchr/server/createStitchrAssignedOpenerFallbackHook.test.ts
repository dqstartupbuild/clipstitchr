import { describe, expect, it } from "vitest";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import { createStitchrAssignedOpenerFallbackHook } from "@/lib/clipstitchr/server/createStitchrAssignedOpenerFallbackHook";
import { getStitchrHookMatchesAssignedOpener } from "@/lib/clipstitchr/server/getStitchrHookMatchesAssignedOpener";
import { getStitchrHookTextIsUsable } from "@/lib/clipstitchr/server/getStitchrHookTextIsUsable";
import { getUgcDiscoveryHookCoordinates } from "@/lib/clipstitchr/server/getUgcDiscoveryHookCoordinates";

describe("createStitchrAssignedOpenerFallbackHook", () => {
  it("preserves all thirty assigned opener lanes with usable distinct text", () => {
    const templates = cliprHookTemplates.filter((template) => {
      const coordinates = getUgcDiscoveryHookCoordinates(template.id);

      return coordinates?.patternIndex === 0;
    });
    const hooks = templates.map((template) => ({
      hook: createStitchrAssignedOpenerFallbackHook(template),
      template,
    }));

    expect(hooks).toHaveLength(30);
    expect(new Set(hooks.map(({ hook }) => hook)).size).toBe(30);
    expect(
      hooks.every(
        ({ hook, template }) =>
          getStitchrHookTextIsUsable(hook) &&
          getStitchrHookMatchesAssignedOpener({ hook, template }),
      ),
    ).toBe(true);
  });
});
