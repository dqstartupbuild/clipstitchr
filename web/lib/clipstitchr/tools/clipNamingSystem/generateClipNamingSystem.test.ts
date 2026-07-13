import { describe, expect, it } from "vitest";
import { defaultClipNamingSystemInput } from "@/lib/clipstitchr/tools/clipNamingSystem/defaultClipNamingSystemInput";
import { generateClipNamingSystem } from "@/lib/clipstitchr/tools/clipNamingSystem/generateClipNamingSystem";

describe("generateClipNamingSystem", () => {
  it("builds a sanitized convention, legend, and examples", () => {
    const result = generateClipNamingSystem({
      ...defaultClipNamingSystemInput,
      app: "ClipStitchr/Pro",
    });

    expect(result.filename).toBe(
      "clipstitchr_pro_summer_launch_ugc_hook_maya_before_and_after_us_2026_07_12_v01.mp4",
    );
    expect(result.convention).toContain("[app]_[campaign]_[role]");
    expect(result.legend).toHaveLength(8);
    expect(result.examples).toHaveLength(3);
  });

  it("respects token order and restores accidentally omitted tokens", () => {
    const result = generateClipNamingSystem({
      ...defaultClipNamingSystemInput,
      tokenOrder: ["date", "app", "campaign"],
    });

    expect(result.filename).toMatch(/^2026_07_12_clipstitchr_summer_launch_/);
    expect(result.legend.map((item) => item.token)).toEqual([
      "date",
      "app",
      "campaign",
      "role",
      "creator",
      "concept",
      "market",
      "version",
    ]);
  });
});
