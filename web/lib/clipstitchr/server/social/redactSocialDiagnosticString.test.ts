import { describe, expect, it } from "vitest";
import { redactSocialDiagnosticString } from "./redactSocialDiagnosticString";

describe("redactSocialDiagnosticString", () => {
  it("redacts nested provider credentials while preserving useful context", () => {
    const result = redactSocialDiagnosticString(
      JSON.stringify({
        error: {
          access_token: "secret-access-token",
          message: "Provider rejected this request.",
        },
        cookie: "session=secret-cookie",
        mediaUrl: "https://media.example.com/private?signature=signed-value",
        refreshToken: "secret-refresh-token",
        requestId: "request_123",
      }),
    );

    expect(result).toContain("Provider rejected this request.");
    expect(result).toContain("request_123");
    expect(result).not.toContain("secret-access-token");
    expect(result).not.toContain("secret-cookie");
    expect(result).not.toContain("signed-value");
    expect(result).not.toContain("secret-refresh-token");
    expect(result).toContain("[REDACTED]");
  });

  it("redacts bearer headers, query credentials, and plain-text secrets", () => {
    const result = redactSocialDiagnosticString(
      "Authorization: Bearer abc.def access_token=query-secret client_secret=client-secret",
    );

    expect(result).not.toContain("abc.def");
    expect(result).not.toContain("query-secret");
    expect(result).not.toContain("client-secret");
    expect(result.match(/\[REDACTED\]/g)?.length).toBeGreaterThanOrEqual(3);
  });
});
