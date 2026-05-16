import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getIsAuthorizedIndexNowRequest } from "@/lib/clipstitchr/server/indexnow/getIsAuthorizedIndexNowRequest";

const originalSubmitSecret = process.env.INDEXNOW_SUBMIT_SECRET;

describe("getIsAuthorizedIndexNowRequest", () => {
  beforeEach(() => {
    process.env.INDEXNOW_SUBMIT_SECRET = "test-indexnow-submit-secret";
  });

  afterEach(() => {
    if (originalSubmitSecret === undefined) {
      delete process.env.INDEXNOW_SUBMIT_SECRET;
      return;
    }

    process.env.INDEXNOW_SUBMIT_SECRET = originalSubmitSecret;
  });

  it("authorizes bearer token requests", () => {
    const request = new Request("https://clipstitchr.com/api/indexnow", {
      headers: {
        authorization: "Bearer test-indexnow-submit-secret",
      },
      method: "POST",
    });

    expect(getIsAuthorizedIndexNowRequest(request)).toBe(true);
  });

  it("authorizes submit secret header requests", () => {
    const request = new Request("https://clipstitchr.com/api/indexnow", {
      headers: {
        "x-indexnow-submit-secret": "test-indexnow-submit-secret",
      },
      method: "POST",
    });

    expect(getIsAuthorizedIndexNowRequest(request)).toBe(true);
  });

  it("rejects incorrect secrets", () => {
    const request = new Request("https://clipstitchr.com/api/indexnow", {
      headers: {
        authorization: "Bearer wrong-secret",
      },
      method: "POST",
    });

    expect(getIsAuthorizedIndexNowRequest(request)).toBe(false);
  });
});
