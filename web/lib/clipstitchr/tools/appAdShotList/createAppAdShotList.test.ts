import { describe, expect, it } from "vitest";
import { createAppAdShotList } from "@/lib/clipstitchr/tools/appAdShotList/createAppAdShotList";
import { defaultAppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/defaultAppAdShotListInput";
import { formatAppAdShotListText } from "@/lib/clipstitchr/tools/appAdShotList/formatAppAdShotListText";
import { getAppAdShotListMissingFields } from "@/lib/clipstitchr/tools/appAdShotList/getAppAdShotListMissingFields";

describe("createAppAdShotList", () => {
  it.each([1, 3, 5] as const)(
    "creates individual files for %s openings",
    (openingCount) => {
      const result = createAppAdShotList({
        ...defaultAppAdShotListInput,
        openingCount,
      });

      expect(
        result.shots.filter((shot) => shot.group === "opening"),
      ).toHaveLength(openingCount);
      expect(result.totalPlannedFiles).toBe(openingCount + 4);
      expect(new Set(result.shots.map((shot) => shot.id)).size).toBe(
        result.shots.length,
      );
    },
  );

  it("adds approved proof once without strengthening it", () => {
    const result = createAppAdShotList({
      ...defaultAppAdShotListInput,
      proofPoint: "A customer approved this exact quote",
    });
    const proofShots = result.shots.filter((shot) => shot.group === "proof");

    expect(proofShots).toHaveLength(1);
    expect(proofShots[0]?.action).toContain(
      "A customer approved this exact quote",
    );
    expect(proofShots[0]?.audioDirection).toContain("Do not add numbers");
  });

  it("does not create a proof capture when proof is blank", () => {
    const result = createAppAdShotList(defaultAppAdShotListInput);

    expect(result.shots.some((shot) => shot.group === "proof")).toBe(false);
  });

  it("uses the chosen angle for a materially different first capture", () => {
    const actions = (
      [
        "audience-callout",
        "problem-first",
        "outcome-first",
        "demo-first",
      ] as const
    ).map(
      (openingAngle) =>
        createAppAdShotList({ ...defaultAppAdShotListInput, openingAngle })
          .shots[0]?.action,
    );

    expect(new Set(actions).size).toBe(4);
  });

  it("changes the capture treatment for creator styles", () => {
    const direct = createAppAdShotList({
      ...defaultAppAdShotListInput,
      creatorStyle: "direct-to-camera",
    });
    const visual = createAppAdShotList({
      ...defaultAppAdShotListInput,
      creatorStyle: "reaction-and-b-roll",
    });

    expect(direct.shots[0]?.source).toBe("creator");
    expect(visual.shots[0]?.source).toBe("b-roll");
    expect(direct.shots[0]?.audioDirection).not.toBe(
      visual.shots[0]?.audioDirection,
    );
  });

  it("formats every individual capture and clean-file boundary", () => {
    const text = formatAppAdShotListText(
      createAppAdShotList(defaultAppAdShotListInput),
    );

    expect(text).toContain("HOOK-01");
    expect(text).toContain("DEMO-01");
    expect(text).toContain("7 planned files");
    expect(text).toContain(
      "Keep UGC and product-demo footage in separate files",
    );
    expect(text).not.toContain("undefined");
  });

  it("reports required blank fields before generation", () => {
    expect(
      getAppAdShotListMissingFields({
        ...defaultAppAdShotListInput,
        appName: " ",
        callToAction: "",
      }),
    ).toEqual(["app name", "call to action"]);
  });
});
