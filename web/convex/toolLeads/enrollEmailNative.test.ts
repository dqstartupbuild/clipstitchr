import { beforeEach, describe, expect, it, vi } from "vitest";
import { enrollEmailNative } from "./enrollEmailNative";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  activateCourseEntitlement: vi.fn(),
  getOrCreateMarketingWorkflowEnrollment: vi.fn(),
  getValidCourseAccessSession: vi.fn(),
  rateLimiter: {
    limit: vi.fn(
      async (ctx: unknown, bucket: string, options: unknown) => {
        void ctx;
        void bucket;
        void options;
        return { ok: true };
      },
    ),
  },
}));

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: vi.fn(),
}));
vi.mock("../courseAccess/activateCourseEntitlement", () => ({
  activateCourseEntitlement: mocks.activateCourseEntitlement,
}));
vi.mock("../courseAccess/getValidCourseAccessSession", () => ({
  getValidCourseAccessSession: mocks.getValidCourseAccessSession,
}));
vi.mock("../email/getOrCreateMarketingWorkflowEnrollment", () => ({
  getOrCreateMarketingWorkflowEnrollment:
    mocks.getOrCreateMarketingWorkflowEnrollment,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

const args = {
  clientKey: "a".repeat(64),
  enrolledAt: 100,
  gateVariant: "hybrid-v1" as const,
  courseSessionTokenHash: "b".repeat(64),
  secret: "secret",
  source: "five-day-app-content-sprint" as const,
  workflowKey: "five_day_content_sprint_enrolled" as const,
  workflowVersion: "v1" as const,
};

function createContext(existingEnrollment: unknown = null) {
  const contact = {
    _id: "contact_1",
    consentStatus: "confirmed",
    deletionStatus: "active",
    leadSegment: "hooks-and-messaging",
    marketingEligible: true,
    subscriptionStatus: "subscribed",
    suppressionStatus: "none",
    verificationStatus: "verified",
  };
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const db = {
    get: vi.fn(async () => contact),
    patch: vi.fn(),
    query: vi.fn((table) => {
      const chain = {
        unique: vi.fn(async () =>
          table === "marketingWorkflowEnrollments"
            ? existingEnrollment
            : null,
        ),
        withIndex: vi.fn((_name, callback) => {
          callback(indexQuery);
          return chain;
        }),
      };
      return chain;
    }),
  };

  return { db };
}

describe("explicit email-native enrollment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimiter.limit.mockResolvedValue({ ok: true });
    mocks.getValidCourseAccessSession.mockResolvedValue({
      contact: {
        _id: "contact_1",
        consentStatus: "confirmed",
        deletionStatus: "active",
        leadSegment: "hooks-and-messaging",
        marketingEligible: true,
        subscriptionStatus: "subscribed",
        suppressionStatus: "none",
        verificationStatus: "verified",
      },
      session: { _id: "session_1" },
    });
  });

  it("returns an idempotent accepted result before consuming contact quota", async () => {
    const ctx = createContext({ _id: "enrollment_1" });

    await expect(getHandler(enrollEmailNative)(ctx, args)).resolves.toEqual({
      accepted: true,
    });
    expect(
      mocks.rateLimiter.limit.mock.calls.map((call) => call[1]),
    ).toEqual([
      "emailNativeEnrollmentByClient",
      "emailNativeEnrollmentGlobal",
    ]);
    expect(mocks.getOrCreateMarketingWorkflowEnrollment).not.toHaveBeenCalled();
  });

  it("silently suppresses exhausted contact quota without revealing the token", async () => {
    const ctx = createContext();
    mocks.rateLimiter.limit.mockImplementation(
      async (context: unknown, bucket: string, options: unknown) => {
        void context;
        void options;
        return { ok: bucket !== "emailNativeEnrollmentByContact" };
      },
    );

    await expect(getHandler(enrollEmailNative)(ctx, args)).resolves.toEqual({
      accepted: true,
    });
    expect(mocks.getOrCreateMarketingWorkflowEnrollment).not.toHaveBeenCalled();
    expect(mocks.rateLimiter.limit).toHaveBeenCalledWith(
      ctx,
      "emailNativeEnrollmentByContact",
      { key: "contact_1", throws: false },
    );
  });
});
