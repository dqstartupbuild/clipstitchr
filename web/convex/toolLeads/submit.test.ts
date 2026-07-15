import { beforeEach, describe, expect, it, vi } from "vitest";
import { submit } from "./submit";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  activateCourseEntitlement: vi.fn(),
  assertRateLimitApiSecret: vi.fn(),
  createEmailConfirmationToken: vi.fn(
    async (ctx: unknown, args: Record<string, unknown>) => {
      void ctx;
      void args;
      return "confirmation_1";
    },
  ),
  createMarketingConsentForCapture: vi.fn(
    async (ctx: unknown, args: Record<string, unknown>) => {
      void ctx;
      void args;
      return "consent_1";
    },
  ),
  enqueueEmailProviderOperation: vi.fn(
    async (ctx: unknown, args: Record<string, unknown>) => {
      void ctx;
      void args;
      return "operation_1";
    },
  ),
  getOrCreateMarketingWorkflowEnrollment: vi.fn(
    async (ctx: unknown, args: Record<string, unknown>) => {
      void ctx;
      void args;
      return {
        created: true,
        enrollmentId: "enrollment_1",
      };
    },
  ),
  getOrCreateCourseEntitlement: vi.fn(),
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
  rotateBrowserRecognitionToken: vi.fn(async () => "recognition_1"),
  upsertMarketingContactForCapture: vi.fn(
    async (ctx: unknown, args: Record<string, unknown>) => {
      void ctx;
      void args;
      return {
        contactId: "contact_1",
        wasMarketingEligible: false,
      };
    },
  ),
}));

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../browserRecognition/rotateBrowserRecognitionToken", () => ({
  rotateBrowserRecognitionToken: mocks.rotateBrowserRecognitionToken,
}));
vi.mock("../courseAccess/activateCourseEntitlement", () => ({
  activateCourseEntitlement: mocks.activateCourseEntitlement,
}));
vi.mock("../courseAccess/getOrCreateCourseEntitlement", () => ({
  getOrCreateCourseEntitlement: mocks.getOrCreateCourseEntitlement,
}));
vi.mock("../courseAccess/getValidCourseAccessSession", () => ({
  getValidCourseAccessSession: mocks.getValidCourseAccessSession,
}));
vi.mock("../email/createEmailConfirmationToken", () => ({
  createEmailConfirmationToken: mocks.createEmailConfirmationToken,
}));
vi.mock("../email/enqueueEmailProviderOperation", () => ({
  enqueueEmailProviderOperation: mocks.enqueueEmailProviderOperation,
}));
vi.mock("../email/getOrCreateMarketingWorkflowEnrollment", () => ({
  getOrCreateMarketingWorkflowEnrollment:
    mocks.getOrCreateMarketingWorkflowEnrollment,
}));
vi.mock("../marketingContacts/createMarketingConsentForCapture", () => ({
  createMarketingConsentForCapture: mocks.createMarketingConsentForCapture,
}));
vi.mock("../marketingContacts/getMarketingLeadSegmentForTool", () => ({
  getMarketingLeadSegmentForTool: () => "hooks-and-messaging",
}));
vi.mock("../marketingContacts/upsertMarketingContactForCapture", () => ({
  upsertMarketingContactForCapture:
    mocks.upsertMarketingContactForCapture,
}));
vi.mock("../rateLimiter", () => ({ rateLimiter: mocks.rateLimiter }));
vi.mock("./getToolLeadGateModeIsValid", () => ({
  getToolLeadGateModeIsValid: () => true,
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

const capturedAt = Date.UTC(2026, 6, 13, 12);
const validArgs = {
  capturedAt,
  clientKey: "a".repeat(64),
  confirmationExpiresAt: capturedAt + 48 * 60 * 60 * 1000,
  consentCopyVersion: "public-tools-v1",
  email: " Founder@Example.COM ",
  gateMode: "useful-preview" as const,
  gateVariant: "hybrid-v1" as const,
  name: " Ada Founder ",
  providerContactKey: "p".repeat(32),
  recognitionExpiresAt: capturedAt + 180 * 24 * 60 * 60 * 1000,
  recognitionTokenHash: "b".repeat(64),
  secret: "rate-limit-secret",
  source: "app-hook-generator" as const,
  tokenDigest: "c".repeat(64),
  tokenRecordId: "t".repeat(32),
};

function createContext() {
  return {
    db: {
      insert: vi.fn(async () => "capture_1"),
      patch: vi.fn(),
    },
  };
}

describe("canonical tool lead capture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rateLimiter.limit.mockResolvedValue({ ok: true });
    mocks.upsertMarketingContactForCapture.mockResolvedValue({
      contactId: "contact_1",
      wasMarketingEligible: false,
    });
    mocks.getOrCreateMarketingWorkflowEnrollment.mockResolvedValue({
      created: true,
      enrollmentId: "enrollment_1",
    });
    mocks.getValidCourseAccessSession.mockResolvedValue(null);
  });

  it("consumes capture and confirmation quotas before creating outbox work", async () => {
    const ctx = createContext();

    await expect(getHandler(submit)(ctx, validArgs)).resolves.toEqual({
      accepted: true,
    });
    expect(mocks.rateLimiter.limit.mock.calls.map((call) => call[1])).toEqual([
      "toolLeadSubmitByClient",
      "toolLeadSubmitByEmail",
      "toolLeadSubmitGlobal",
      "emailConfirmationSendByEmail",
      "emailConfirmationSendByClient",
      "emailConfirmationSendGlobal",
      "emailTransactionalByContact",
      "emailTransactionalGlobal",
    ]);
    expect(
      mocks.rateLimiter.limit.mock.invocationCallOrder.at(-1),
    ).toBeLessThan(
      mocks.enqueueEmailProviderOperation.mock.invocationCallOrder[0]!,
    );
    expect(mocks.enqueueEmailProviderOperation).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        kind: "transactional",
        transactionalTemplateKey: "email-confirmation",
      }),
    );
  });

  it("accepts and unlocks without revealing an exhausted confirmation quota", async () => {
    const ctx = createContext();
    mocks.rateLimiter.limit.mockImplementation(
      async (context: unknown, bucket: string, options: unknown) => {
        void context;
        void options;
        return { ok: bucket !== "emailConfirmationSendByEmail" };
      },
    );

    await expect(getHandler(submit)(ctx, validArgs)).resolves.toEqual({
      accepted: true,
    });
    expect(ctx.db.insert).toHaveBeenCalledWith(
      "toolLeadCaptures",
      expect.objectContaining({ contactId: "contact_1" }),
    );
    expect(mocks.rotateBrowserRecognitionToken).toHaveBeenCalledOnce();
    expect(mocks.createEmailConfirmationToken).not.toHaveBeenCalled();
    expect(mocks.enqueueEmailProviderOperation).not.toHaveBeenCalled();
    expect(
      mocks.rateLimiter.limit.mock.calls
        .filter((call) =>
          String(call[1]).startsWith("emailConfirmation"),
        )
        .every(
          (call) =>
            (call[2] as { throws?: boolean }).throws === false,
        ),
    ).toBe(true);
  });

  it("creates only a pending entitlement before course confirmation", async () => {
    const ctx = createContext();

    await getHandler(submit)(ctx, {
      ...validArgs,
      gateMode: "email-native",
      source: "five-day-app-content-sprint",
    });

    expect(mocks.getOrCreateCourseEntitlement).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        courseKey: "five-day-app-content-sprint",
        courseVersion: "v1",
      }),
    );
    expect(mocks.getOrCreateMarketingWorkflowEnrollment).not.toHaveBeenCalled();
    expect(mocks.createEmailConfirmationToken).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({ courseKey: "five-day-app-content-sprint" }),
    );
    expect(mocks.rateLimiter.limit.mock.calls.map((call) => call[1])).toEqual([
      "toolLeadSubmitByClient",
      "toolLeadSubmitByEmail",
      "toolLeadSubmitGlobal",
      "emailNativeEnrollmentByClient",
      "emailNativeEnrollmentByContact",
      "emailNativeEnrollmentGlobal",
      "emailConfirmationSendByEmail",
      "emailConfirmationSendByClient",
      "emailConfirmationSendGlobal",
      "emailTransactionalByContact",
      "emailTransactionalGlobal",
    ]);
    expect(
      mocks.rateLimiter.limit.mock.invocationCallOrder.at(-1),
    ).toBeLessThan(
      mocks.enqueueEmailProviderOperation.mock.invocationCallOrder[0]!,
    );
  });

  it("dedupes general and email-native workflows for an eligible contact", async () => {
    const ctx = createContext();
    mocks.upsertMarketingContactForCapture.mockResolvedValue({
      contactId: "contact_1",
      wasMarketingEligible: true,
    });
    mocks.getOrCreateMarketingWorkflowEnrollment.mockImplementation(
      async (context: unknown, args: Record<string, unknown>) => {
        void context;
        return {
          created: true,
          enrollmentId:
            args.workflowKey === "tool_lead_captured"
              ? "general_enrollment"
              : "native_enrollment",
        };
      },
    );
    mocks.getValidCourseAccessSession.mockResolvedValue({
      contact: { _id: "contact_1" },
      session: { _id: "session_1" },
    });

    await getHandler(submit)(ctx, {
      ...validArgs,
      courseSessionTokenHash: "d".repeat(64),
      gateMode: "email-native",
      source: "five-day-app-content-sprint",
    });

    expect(mocks.createEmailConfirmationToken).not.toHaveBeenCalled();
    expect(mocks.enqueueEmailProviderOperation).toHaveBeenCalledTimes(3);
    expect(
      mocks.enqueueEmailProviderOperation.mock.calls.filter(
        (call) => call[1].kind === "workflowEvent",
      ).map((call) => call[1].workflowKey),
    ).toEqual([
      "tool_lead_captured",
      "five_day_content_sprint_enrolled",
    ]);
    expect(mocks.rateLimiter.limit.mock.calls.map((call) => call[1])).toEqual([
      "toolLeadSubmitByClient",
      "toolLeadSubmitByEmail",
      "toolLeadSubmitGlobal",
      "emailNativeEnrollmentByClient",
      "emailNativeEnrollmentByContact",
      "emailNativeEnrollmentGlobal",
      "emailWorkflowEventByContact",
      "emailWorkflowEventGlobal",
      "emailWorkflowEventByContact",
      "emailWorkflowEventGlobal",
    ]);
    expect(
      mocks.rateLimiter.limit.mock.invocationCallOrder.at(-1),
    ).toBeLessThan(
      mocks.enqueueEmailProviderOperation.mock.invocationCallOrder[0]!,
    );
  });
});
