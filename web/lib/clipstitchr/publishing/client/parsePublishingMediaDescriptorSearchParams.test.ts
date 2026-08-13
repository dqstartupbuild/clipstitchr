import { describe, expect, it } from "vitest";
import { parsePublishingMediaDescriptorSearchParams } from "@/lib/clipstitchr/publishing/client/parsePublishingMediaDescriptorSearchParams";

describe("parsePublishingMediaDescriptorSearchParams", () => {
  it("accepts only durable saved media descriptors", () => {
    expect(
      parsePublishingMediaDescriptorSearchParams({
        kind: "stitch",
        recordId: "stitch_123",
      }),
    ).toEqual({
      descriptor: { kind: "stitch", recordId: "stitch_123" },
      error: null,
    });
    expect(
      parsePublishingMediaDescriptorSearchParams({
        kind: "studio-clip-output",
        recordId: "output_123",
      }),
    ).toEqual({
      descriptor: { kind: "studio-clip-output", recordId: "output_123" },
      error: null,
    });
    expect(
      parsePublishingMediaDescriptorSearchParams({
        kind: "studio-stitch-output",
        recordId: "output_456",
      }),
    ).toEqual({
      descriptor: {
        kind: "studio-stitch-output",
        recordId: "output_456",
      },
      error: null,
    });
  });

  it("rejects URLs, object keys, arrays, and unsupported kinds", () => {
    expect(
      parsePublishingMediaDescriptorSearchParams({
        kind: "swipe",
        recordId: "https://r2.invalid/file",
      }).descriptor,
    ).toBeNull();
    expect(
      parsePublishingMediaDescriptorSearchParams({
        kind: ["stitch"],
        recordId: "stitch_123",
      }).descriptor,
    ).toBeNull();
    expect(
      parsePublishingMediaDescriptorSearchParams({
        kind: "upload",
        recordId: "item_123",
      }).descriptor,
    ).toBeNull();
  });
});
