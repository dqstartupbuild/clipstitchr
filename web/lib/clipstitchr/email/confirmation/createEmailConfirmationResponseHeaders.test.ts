import { describe, expect, it } from "vitest";
import { createEmailConfirmationResponseHeaders } from "@/lib/clipstitchr/email/confirmation/createEmailConfirmationResponseHeaders";

describe("createEmailConfirmationResponseHeaders", () => {
  it("blocks storage, framing, indexing, referrers, scripts, and remote assets", () => {
    const headers = createEmailConfirmationResponseHeaders();
    const policy = headers.get("content-security-policy") ?? "";

    expect(headers.get("cache-control")).toContain("no-store");
    expect(headers.get("referrer-policy")).toBe("no-referrer");
    expect(headers.get("x-content-type-options")).toBe("nosniff");
    expect(headers.get("x-frame-options")).toBe("DENY");
    expect(headers.get("x-robots-tag")).toContain("noindex");
    expect(policy).toContain("default-src 'none'");
    expect(policy).toContain("script-src 'none'");
    expect(policy).toContain("connect-src 'none'");
    expect(policy).toContain("form-action 'self'");
  });
});
