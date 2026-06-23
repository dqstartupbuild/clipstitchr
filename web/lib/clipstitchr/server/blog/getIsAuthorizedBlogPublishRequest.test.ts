import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { getIsAuthorizedBlogPublishRequest } from "./getIsAuthorizedBlogPublishRequest";

const token = "super-long-secret-token-value";

function createRequest(authorization?: string) {
  const headers = new Headers();

  if (authorization !== undefined) {
    headers.set("authorization", authorization);
  }

  return new Request("https://example.com/api/webhooks/blog-publisher", {
    method: "POST",
    headers,
  });
}

describe("getIsAuthorizedBlogPublishRequest", () => {
  beforeEach(() => {
    process.env.BLOG_PUBLISH_WEBHOOK_TOKEN = token;
  });

  afterEach(() => {
    delete process.env.BLOG_PUBLISH_WEBHOOK_TOKEN;
  });

  it("accepts a matching bearer token", () => {
    expect(getIsAuthorizedBlogPublishRequest(createRequest(`Bearer ${token}`))).toBe(
      true,
    );
  });

  it("rejects a wrong bearer token", () => {
    expect(
      getIsAuthorizedBlogPublishRequest(createRequest("Bearer wrong-token")),
    ).toBe(false);
  });

  it("rejects a missing authorization header", () => {
    expect(getIsAuthorizedBlogPublishRequest(createRequest())).toBe(false);
  });

  it("rejects a non-bearer scheme", () => {
    expect(
      getIsAuthorizedBlogPublishRequest(createRequest(`Token ${token}`)),
    ).toBe(false);
  });

  it("throws when the token env var is missing", () => {
    delete process.env.BLOG_PUBLISH_WEBHOOK_TOKEN;

    expect(() =>
      getIsAuthorizedBlogPublishRequest(createRequest(`Bearer ${token}`)),
    ).toThrow("Missing BLOG_PUBLISH_WEBHOOK_TOKEN.");
  });
});
