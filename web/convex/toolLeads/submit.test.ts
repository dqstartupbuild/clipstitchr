import { beforeEach, describe, expect, it, vi } from "vitest";
import { submit } from "./submit";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  assertRateLimitApiSecret: vi.fn(),
  createEmailConfirmationToken: vi.fn(
    async (_ctx: unknown, _args: Record<string, unknown>) => "confirmation_1",
  ),
  createMarketingConsentForCapture: vi.fn(
    async (_ctx: unknown, _args: Record<string, unknown>) => "consent_1",
  ),
  enqueueEmailProviderOperation: vi.fn(
    async (_ctx: unknown, _args: Record<string, unknown>) => "operation_1",
  ),
  getOrCreateMarketingWorkflowEnrollment: vi.fn(
    async (_ctx: unknown, _args: Record<string, unknown>) => ({
      created: true,
      enrollmentId: "enrollment_1",
    }),
  ),
  rateLimiter: {
    limit: vi.fn(
      async (_ctx: unknown, _bucket: string, _options: unknown) => ({
        ok: true,
      }),
    ),
  },
  rotateBrowserRecognitionToken: vi.fn(async () => "recognition_1"),
  upsertMarketingContactForCapture: vi.fn(
    async (_ctx: unknown, _args: Record<string, unknown>) => ({
      contactId: "contact_1",
      wasMarketingEligible: false,
    }),
  ),
}));

vi.mock("../_generated/server", () => ({ mutation: vi.fn((value) => value) }));
vi.mock("../auth/assertRateLimitApiSecret", () => ({
  assertRateLimitApiSecret: mocks.assertRateLimitApiSecret,
}));
vi.mock("../browserRecognition/rotateBrowserRecognitionToken", () => ({
  rotateBrowserRecognitionToken: mocks.rotateBrowserRecognitionToken,
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
      async (_ctx, bucket: string, _options: unknown) => ({
        ok: bucket !== "emailConfirmationSendByEmail",
      }),
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

  it("creates only the catalog-approved email-native enrollment", async () => {
    const ctx = createContext();

    await getHandler(submit)(ctx, {
      ...validArgs,
      gateMode: "email-native",
      source: "five-day-app-content-sprint",
    });

    expect(mocks.getOrCreateMarketingWorkflowEnrollment).toHaveBeenCalledTimes(1);
    expect(mocks.getOrCreateMarketingWorkflowEnrollment).toHaveBeenCalledWith(
      ctx,
      expect.objectContaining({
        workflowKey: "five_day_content_sprint_enrolled",
        workflowVersion: "v1",
      }),
    );
    expect(
      mocks.getOrCreateMarketingWorkflowEnrollment.mock.calls.flatMap(
        (call) => Object.values(call[1]),
      ),
    ).not.toContain("ugc_app_ad_course_enrolled");
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
      async (_ctx, args: Record<string, unknown>) => ({
        created: true,
        enrollmentId:
          args.workflowKey === "tool_lead_captured"
            ? "general_enrollment"
            : "native_enrollment",
      }),
    );

    await getHandler(submit)(ctx, {
      ...validArgs,
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
