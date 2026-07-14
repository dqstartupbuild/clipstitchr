import { describe, expect, it } from "vitest";
import { getEmailNativeWorkflowKeyForSource } from "./getEmailNativeWorkflowKeyForSource";

describe("email-native workflow mapping", () => {
  it("maps only the three approved tools to their own workflow", () => {
    expect(getEmailNativeWorkflowKeyForSource("five-day-app-content-sprint")).toBe(
      "five_day_content_sprint_enrolled",
    );
    expect(getEmailNativeWorkflowKeyForSource("ugc-to-app-ad-mini-course")).toBe(
      "ugc_app_ad_course_enrolled",
    );
    expect(
      getEmailNativeWorkflowKeyForSource(
        "app-creative-testing-system-workshop",
      ),
    ).toBe("creative_testing_workshop_enrolled");
    expect(getEmailNativeWorkflowKeyForSource("app-hook-generator")).toBeNull();
  });
});
