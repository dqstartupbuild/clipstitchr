import { afterEach, describe, expect, it } from "vitest";
import { getPostBridgeLegacyWriteResponse } from "./getPostBridgeLegacyWriteResponse";

describe("getPostBridgeLegacyWriteResponse", () => {
  afterEach(() => {
    delete process.env.SOCIAL_PUBLISHING_PROVIDER;
  });

  it("allows legacy writes while Post Bridge is active", () => {
    process.env.SOCIAL_PUBLISHING_PROVIDER = "post_bridge";

    expect(getPostBridgeLegacyWriteResponse()).toBeNull();
  });

  it("blocks legacy writes while direct publishing is active", async () => {
    process.env.SOCIAL_PUBLISHING_PROVIDER = "in_house";

    const response = getPostBridgeLegacyWriteResponse();

    expect(response?.status).toBe(409);
    await expect(response?.json()).resolves.toEqual({
      error:
        "Post Bridge is read-only while ClipStitchr's direct social publishing is active.",
    });
  });
});
