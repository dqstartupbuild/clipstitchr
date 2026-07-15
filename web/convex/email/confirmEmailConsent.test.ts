import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirmEmailConsent } from "./confirmEmailConsent";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  activateCourseEntitlement: vi.fn(),
  createCourseAccessSession: vi.fn(),
  enqueueEmailProviderOperation: vi.fn(),
  getEmailConfirmationTokenIsAvailable: vi.fn(() => true),
  getOrCreateMarketingWorkflowEnrollment: vi.fn(),
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
  validateEmailConfirmationReference: vi.fn(() => true),
}));

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: vi.fn(),
}));
vi.mock("../courseAccess/activateCourseEntitlement", () => ({
  activateCourseEntitlement: mocks.activateCourseEntitlement,
}));
vi.mock("../courseAccess/createCourseAccessSession", () => ({
  createCourseAccessSession: mocks.createCourseAccessSession,
}));
vi.mock("./enqueueEmailProviderOperation", () => ({
  enqueueEmailProviderOperation: mocks.enqueueEmailProviderOperation,
}));
vi.mock("./getEmailConfirmationTokenIsAvailable", () => ({
  getEmailConfirmationTokenIsAvailable:
    mocks.getEmailConfirmationTokenIsAvailable,
}));
vi.mock("./getOrCreateMarketingWorkflowEnrollment", () => ({
  getOrCreateMarketingWorkflowEnrollment:
    mocks.getOrCreateMarketingWorkflowEnrollment,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));
vi.mock("./validateEmailConfirmationReference", () => ({
  validateEmailConfirmationReference:
    mocks.validateEmailConfirmationReference,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

function createContext(
  resumable = false,
  courseKey?: "five-day-app-content-sprint",
) {
  const token = { _id: "token_1", contactId: "contact_1", courseKey };
  const contact = {
    _id: "contact_1",
    currentConsentId: "consent_1",
    deletionStatus: "active",
    leadSegment: "hooks-and-messaging",
    subscriptionStatus: "notSubscribed",
  };
  const consent = { _id: "consent_1", contactId: "contact_1" };
  const workflowKeys = resumable
    ? ["tool_lead_captured"]
    : [
        "tool_lead_captured",
        "five_day_content_sprint_enrolled",
        "ugc_app_ad_course_enrolled",
        "creative_testing_workshop_enrolled",
      ];
  const enrollments = workflowKeys.map((workflowKey, index) => ({
    _id: `enrollment_${index + 1}`,
    contactId: "contact_1",
    operationId: resumable ? "canceled_operation_1" : undefined,
    status: "pending",
    workflowKey,
    workflowVersion: "v1",
  }));
  const canceledOperation = {
    _id: "canceled_operation_1",
    acceptanceStatus: "notAttempted",
    attemptLeaseOwner: undefined,
    status: "canceled",
  };
  const latestCapture = {
    gateMode: "useful-preview",
    source: "app-hook-generator",
  };
  const indexQuery = { eq: vi.fn(() => indexQuery) };
  const db = {
    get: vi.fn(async (id) =>
      id === "contact_1"
        ? contact
        : id === "consent_1"
          ? consent
          : id === "canceled_operation_1"
            ? canceledOperation
            : null,
    ),
    patch: vi.fn(),
    query: vi.fn((table) => {
      const chain = {
        collect: vi.fn(async () =>
          table === "marketingWorkflowEnrollments" ? enrollments : [],
        ),
        first: vi.fn(async () => latestCapture),
        order: vi.fn(() => chain),
        unique: vi.fn(async () =>
          table === "emailConfirmationTokens" ? token : null,
        ),
        withIndex: vi.fn((_name, callback) => {
          callback(indexQuery);
          return chain;
        }),
      };
      return chain;
    }),
  };

  return { db, enrollments, scheduler: { runAfter: vi.fn() } };
}

describe("email consent confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueueEmailProviderOperation
      .mockReset()
      .mockResolvedValueOnce("contact_sync_1")
      .mockResolvedValueOnce("workflow_1")
      .mockResolvedValueOnce("workflow_2")
      .mockResolvedValueOnce("workflow_3")
      .mockResolvedValueOnce("workflow_4");
    mocks.getOrCreateMarketingWorkflowEnrollment.mockResolvedValue({
      created: false,
      enrollmentId: "enrollment_1",
    });
  });

  it("confirms a regular tool without activating pending course workflows", async () => {
    const ctx = createContext();

    await expect(
      getHandler(confirmEmailConsent)(ctx, {
        clientKey: "a".repeat(64),
        confirmedAt: 1_000,
        expiresAt: 2_000,
        secret: "secret",
        tokenDigest: "b".repeat(64),
        tokenRecordId: "c".repeat(32),
      }),
    ).resolves.toEqual({ status: "confirmed" });
    expect(mocks.enqueueEmailProviderOperation).toHaveBeenCalledTimes(2);
    expect(
      mocks.rateLimiter.limit.mock.calls.filter(
        (call) => call[1] === "emailWorkflowEventByContact",
      ),
    ).toHaveLength(1);
    expect(
      ctx.db.patch.mock.calls.filter(([id]) =>
        String(id).startsWith("enrollment_"),
      ),
    ).toHaveLength(1);
    expect(mocks.activateCourseEntitlement).not.toHaveBeenCalled();
    expect(mocks.createCourseAccessSession).not.toHaveBeenCalled();
  });

  it("resumes the same known-unsent canceled workflow after re-consent", async () => {
    const ctx = createContext(true);

    await expect(
      getHandler(confirmEmailConsent)(ctx, {
        clientKey: "a".repeat(64),
        confirmedAt: 1_000,
        expiresAt: 2_000,
        secret: "secret",
        tokenDigest: "b".repeat(64),
        tokenRecordId: "c".repeat(32),
      }),
    ).resolves.toEqual({ status: "confirmed" });
    expect(mocks.enqueueEmailProviderOperation).toHaveBeenCalledTimes(1);
    expect(ctx.db.patch).toHaveBeenCalledWith(
      "canceled_operation_1",
      expect.objectContaining({
        dependsOnOperationId: "contact_sync_1",
        status: "pending",
      }),
    );
    expect(ctx.scheduler.runAfter).toHaveBeenCalledWith(
      0,
      expect.anything(),
      { operationId: "canceled_operation_1" },
    );
  });

  it("activates only the course named by the single-use token", async () => {
    const ctx = createContext(false, "five-day-app-content-sprint");

    await expect(
      getHandler(confirmEmailConsent)(ctx, {
        clientKey: "a".repeat(64),
        confirmedAt: 1_000,
        courseSessionExpiresAt:
          1_000 + 180 * 24 * 60 * 60 * 1_000,
        courseSessionTokenHash: "d".repeat(64),
        expiresAt: 2_000,
        secret: "secret",
        tokenDigest: "b".repeat(64),
        tokenRecordId: "c".repeat(32),
      }),
    ).resolves.toEqual({
      courseKey: "five-day-app-content-sprint",
      status: "confirmed",
    });
    expect(mocks.activateCourseEntitlement).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        courseKey: "five-day-app-content-sprint",
      }),
    );
    expect(mocks.createCourseAccessSession).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ tokenHash: "d".repeat(64) }),
    );
    expect(
      ctx.db.patch.mock.calls
        .filter(([id]) => String(id).startsWith("enrollment_"))
        .map(([id]) => id),
    ).toEqual(["enrollment_1", "enrollment_2"]);
  });
});
