import { describe, expect, it } from "vitest";

import { normalizeTikTokTerminalResult } from "../src/workflow/normalizeTikTokTerminalResult.js";

describe("normalizeTikTokTerminalResult", () => {
  it("keeps a private PUBLISH_COMPLETE result published without inventing a public ID", () => {
    expect(
      normalizeTikTokTerminalResult({
        provider: "tiktok",
        kind: "published_not_public",
        providerOperationId: "publish_private_1",
        remotePostIds: Object.freeze([]),
        remoteUrls: Object.freeze([]),
        visibility: "SELF_ONLY",
      }),
    ).toEqual({
      provider: "tiktok",
      kind: "published",
      providerOperationId: "publish_private_1",
      remotePostIds: [],
      remoteUrls: [],
      visibility: "SELF_ONLY",
    });
  });
});
