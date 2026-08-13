import { describe, expect, it } from "vitest";
import { getPublishingCompatibilityWarningKey } from "@/lib/clipstitchr/publishing/client/getPublishingCompatibilityWarningKey";

describe("getPublishingCompatibilityWarningKey", () => {
  it("changes when the media revision or warning content changes", () => {
    const compatibility = {
      destinations: [
        {
          integrationId: "integration_1",
          issues: [
            {
              code: "provider_crop",
              message: "The first frame may be cropped.",
              severity: "warning" as const,
            },
          ],
          status: "warning" as const,
        },
      ],
      mediaRevision: "revision-1",
    };

    const first = getPublishingCompatibilityWarningKey(
      compatibility,
      "integration_1",
    );
    expect(first).not.toBeNull();
    expect(
      getPublishingCompatibilityWarningKey(
        { ...compatibility, mediaRevision: "revision-2" },
        "integration_1",
      ),
    ).not.toBe(first);
    expect(
      getPublishingCompatibilityWarningKey(
        {
          ...compatibility,
          destinations: [
            {
              ...compatibility.destinations[0],
              issues: [
                {
                  code: "provider_crop",
                  message: "The last frame may be cropped.",
                  severity: "warning" as const,
                },
              ],
            },
          ],
        },
        "integration_1",
      ),
    ).not.toBe(first);
  });

  it("does not create an acknowledgement key for ready media", () => {
    expect(
      getPublishingCompatibilityWarningKey(
        {
          destinations: [
            { integrationId: "integration_1", issues: [], status: "ready" },
          ],
          mediaRevision: "revision-1",
        },
        "integration_1",
      ),
    ).toBeNull();
  });
});
