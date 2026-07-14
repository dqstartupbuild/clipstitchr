import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  confirmEmailConsentWithConvex: vi.fn(),
  createEmailConfirmationCsrfToken: vi.fn(),
  inspectEmailConfirmationWithConvex: vi.fn(),
  verifyEmailConfirmationUrl: vi.fn(),
}));

vi.mock(
  "@/lib/clipstitchr/email/confirmation/confirmEmailConsentWithConvex",
  () => ({
    confirmEmailConsentWithConvex: mocks.confirmEmailConsentWithConvex,
  }),
);
vi.mock(
  "@/lib/clipstitchr/email/confirmation/createEmailConfirmationCsrfToken",
  () => ({
    createEmailConfirmationCsrfToken: mocks.createEmailConfirmationCsrfToken,
  }),
);
vi.mock(
  "@/lib/clipstitchr/email/confirmation/inspectEmailConfirmationWithConvex",
  () => ({
    inspectEmailConfirmationWithConvex:
      mocks.inspectEmailConfirmationWithConvex,
  }),
);
vi.mock(
  "@/lib/clipstitchr/email/confirmation/verifyEmailConfirmationUrl",
  () => ({
    verifyEmailConfirmationUrl: mocks.verifyEmailConfirmationUrl,
  }),
);

import { GET, POST } from "@/app/email/confirm/route";

const csrfToken = "c".repeat(43);
const expires = "1783958400000";
const signature = "s".repeat(43);
const tokenRecordId = "123e4567-e89b-42d3-a456-426614174000";
const now = 1_783_900_000_000;
const reference = {
  expiresAt: Number(expires),
  tokenDigest: "d".repeat(64),
  tokenRecordId,
};

function createConfirmationUrl() {
  const url = new URL("https://clipstitchr.com/email/confirm");
  url.searchParams.set("id", tokenRecordId);
  url.searchParams.set("expires", expires);
  url.searchParams.set("signature", signature);
  return url;
}

function createConfirmationPost({
  cookieToken = csrfToken,
  contentLength,
  formToken = csrfToken,
  origin = "https://clipstitchr.com",
}: {
  cookieToken?: string;
  contentLength?: string;
  formToken?: string;
  origin?: string | null;
} = {}) {
  const body = new URLSearchParams({
    csrf: formToken,
    expires,
    id: tokenRecordId,
    signature,
  });
  const headers = new Headers({
    "content-type": "application/x-www-form-urlencoded",
    cookie: `clipstitchr_email_confirmation_csrf=${cookieToken}`,
    "sec-fetch-site": "same-origin",
  });

  if (origin) headers.set("origin", origin);
  if (contentLength) headers.set("content-length", contentLength);

  return new Request("https://clipstitchr.com/email/confirm", {
    body,
    headers,
    method: "POST",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(Date, "now").mockReturnValue(now);
  process.env.RATE_LIMIT_API_SECRET = "rate-limit-secret";
  mocks.createEmailConfirmationCsrfToken.mockReturnValue(csrfToken);
  mocks.inspectEmailConfirmationWithConvex.mockResolvedValue({
    status: "ready",
  });
  mocks.verifyEmailConfirmationUrl.mockResolvedValue(reference);
  mocks.confirmEmailConsentWithConvex.mockResolvedValue({
    status: "confirmed",
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("email confirmation route", () => {
  it("keeps scanner GET requests query-only and serves a standalone form", async () => {
    const response = await GET(new Request(createConfirmationUrl()));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(mocks.inspectEmailConfirmationWithConvex).toHaveBeenCalledWith(
      reference,
      now,
    );
    expect(mocks.confirmEmailConsentWithConvex).not.toHaveBeenCalled();
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-security-policy")).toContain(
      "script-src 'none'",
    );
    expect(response.headers.get("referrer-policy")).toBe("no-referrer");
    expect(response.headers.get("x-frame-options")).toBe("DENY");
    expect(response.headers.get("x-robots-tag")).toContain("noindex");
    expect(response.headers.get("set-cookie")).toContain("HttpOnly");
    expect(response.headers.get("set-cookie")).toContain("SameSite=Strict");
    expect(response.headers.get("set-cookie")).toContain("Secure");
    expect(html).toContain('<form action="/email/confirm" method="post">');
    expect(html).toContain('name="csrf"');
    expect(html).not.toMatch(/<script\b/i);
    expect(html).not.toMatch(/(?:src|href)=["']https?:/i);
  });

  it("uses the same non-enumerating page for malformed and unavailable links", async () => {
    const malformedResponse = await GET(
      new Request("https://clipstitchr.com/email/confirm?id=bad"),
    );
    const malformedHtml = await malformedResponse.text();
    mocks.inspectEmailConfirmationWithConvex.mockResolvedValueOnce({
      status: "unavailable",
    });
    const unavailableResponse = await GET(new Request(createConfirmationUrl()));

    expect(await unavailableResponse.text()).toBe(malformedHtml);
    expect(mocks.confirmEmailConsentWithConvex).not.toHaveBeenCalled();
  });

  it("confirms only after an explicit same-origin POST with matching CSRF", async () => {
    const response = await POST(createConfirmationPost({ origin: null }));
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(mocks.inspectEmailConfirmationWithConvex).not.toHaveBeenCalled();
    expect(mocks.confirmEmailConsentWithConvex).toHaveBeenCalledWith({
      clientKey: expect.stringMatching(/^[a-f0-9]{64}$/),
      confirmedAt: now,
      reference,
    });
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
    expect(html).toContain("Email confirmed");
    expect(html).not.toContain(tokenRecordId);
    expect(html).not.toContain(signature);
    expect(html).not.toMatch(/<script\b/i);
  });

  it("rejects cross-origin and mismatched-CSRF POSTs before confirmation", async () => {
    const crossOriginResponse = await POST(
      createConfirmationPost({ origin: "https://attacker.example" }),
    );
    const csrfResponse = await POST(
      createConfirmationPost({ formToken: "x".repeat(43) }),
    );

    expect(crossOriginResponse.status).toBe(403);
    expect(csrfResponse.status).toBe(403);
    expect(mocks.verifyEmailConfirmationUrl).not.toHaveBeenCalled();
    expect(mocks.confirmEmailConsentWithConvex).not.toHaveBeenCalled();
  });

  it("rejects oversized request bodies before confirmation", async () => {
    const response = await POST(
      createConfirmationPost({ contentLength: "4097" }),
    );

    expect(response.status).toBe(413);
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(mocks.confirmEmailConsentWithConvex).not.toHaveBeenCalled();
  });

  it("returns standalone HTML with retry timing when Convex rate limits", async () => {
    mocks.confirmEmailConsentWithConvex.mockRejectedValueOnce({
      data: {
        kind: "RateLimited",
        name: "emailConfirmationRedeemByClient",
        retryAfter: 1_500,
      },
    });

    const response = await POST(createConfirmationPost());
    const html = await response.text();

    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("2");
    expect(response.headers.get("content-type")).toContain("text/html");
    expect(html).toContain("Please try again later");
    expect(html).not.toContain('"retryAfter"');
  });

  it("does not claim success when the token becomes unavailable", async () => {
    mocks.confirmEmailConsentWithConvex.mockResolvedValueOnce({
      status: "unavailable",
    });

    const response = await POST(createConfirmationPost());
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(html).toContain("Link unavailable");
    expect(html).not.toContain("Email confirmed");
  });
});
