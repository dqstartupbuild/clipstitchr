import type { AppAdCreativeTestingBlueprintResult } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintResult";

export type AppAdCreativeTestingBlueprintBuild =
  | {
      status: "incomplete";
      missingFields: string[];
    }
  | {
      status: "complete";
      result: AppAdCreativeTestingBlueprintResult;
    };
