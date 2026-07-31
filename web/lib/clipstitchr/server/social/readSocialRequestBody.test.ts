import { describe, expect, it } from "vitest";
import { readSocialRequestBody } from "./readSocialRequestBody";

describe("readSocialRequestBody", () => {
  it("rejects a declared body larger than 64 KiB", async () => {
    const request = new Request("https://clipstitchr.com/webhook", {
      method: "POST",
      headers: { "content-length": String(64 * 1024 + 1) },
      body: "small",
    });

    await expect(readSocialRequestBody(request)).rejects.toThrow("too large");
  });

  it("stops an oversized streamed body without a content-length header", async () => {
    const request = new Request("https://clipstitchr.com/webhook", {
      method: "POST",
      body: "x".repeat(64 * 1024 + 1),
    });
    request.headers.delete("content-length");

    await expect(readSocialRequestBody(request)).rejects.toThrow("too large");
  });
});
