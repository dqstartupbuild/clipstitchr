import { beforeEach, describe, expect, it, vi } from "vitest";
import { processEmailProviderOperation } from "./processEmailProviderOperation";

type ConvexFunction<Args, Result> = {
  handler: (ctx: unknown, args: Args) => Promise<Result>;
};

const mocks = vi.hoisted(() => ({
  dispatchEmailProviderOperation: vi.fn(),
  getLoopsReadiness: vi.fn(),
}));

vi.mock("../_generated/server", () => ({
  internalAction: vi.fn((value) => value),
}));
vi.mock("../../lib/clipstitchr/email/loops/createLoopsClient", () => ({
  createLoopsClient: vi.fn(() => ({})),
}));
vi.mock("../../lib/clipstitchr/email/loops/getLoopsReadiness", () => ({
  getLoopsReadiness: mocks.getLoopsReadiness,
}));
vi.mock(
  "../../lib/clipstitchr/email/operations/dispatchEmailProviderOperation",
  () => ({
    dispatchEmailProviderOperation: mocks.dispatchEmailProviderOperation,
  }),
);
vi.mock("../../lib/resolveSiteUrl", () => ({
  resolveSiteUrl: vi.fn(() => "https://clipstitchr.com"),
}));

function getHandler<Args, Result>(convexFunction: unknown) {
  return (convexFunction as ConvexFunction<Args, Result>).handler;
}

describe("email provider operation processor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getLoopsReadiness.mockReturnValue({
      confirmationReady: true,
      contactSyncReady: true,
      dispatchEnabled: true,
      teamEnvironment: "production",
      workflowReady: true,
    });
  });

  it("reports a queued correction instead of success after acceptance loses its fence", async () => {
    const projection = {
      confirmation: null,
      contact: {
        contactName: "Person",
        firstTool: "app-hook-generator",
        latestTool: "app-hook-generator",
        leadSegment: "hooks-and-messaging",
        leadStage: "captured",
        normalizedEmail: "person@example.com",
        providerContactKey: "provider_key",
      },
      operation: {
        idempotencyExpiresAt: Date.now() + 100_000,
        kind: "contactResubscribe",
        operationId: "operation_1",
      },
      transactionalTemplateKey: null,
      workflow: null,
    };
    const ctx = {
      runMutation: vi
        .fn()
        .mockResolvedValueOnce({
          kind: "contactResubscribe",
          status: "claimed",
        })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({
          attemptCount: 1,
          idempotencyExpiresAt: Date.now() + 100_000,
          started: true,
        })
        .mockResolvedValueOnce({
          compensationQueued: true,
          recorded: false,
        }),
      runQuery: vi.fn(async () => projection),
    };

    await expect(
      getHandler(processEmailProviderOperation)(ctx, {
        operationId: "operation_1",
      }),
    ).resolves.toEqual({
      processed: false,
      reason: "compensation-queued",
    });
    expect(mocks.dispatchEmailProviderOperation).toHaveBeenCalledOnce();
  });

  it("rechecks a confirmation generation after pacing and before dispatch", async () => {
    const ctx = {
      runMutation: vi
        .fn()
        .mockResolvedValueOnce({ kind: "transactional", status: "claimed" })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({
          attemptCount: 1,
          idempotencyExpiresAt: Date.now() + 100_000,
          started: true,
        })
        .mockResolvedValueOnce({ status: "deadLetter" }),
      runQuery: vi.fn(async () => null),
    };

    await expect(
      getHandler(processEmailProviderOperation)(ctx, {
        operationId: "operation_1",
      }),
    ).resolves.toEqual({ processed: false, reason: "ineligible" });
    expect(ctx.runQuery).toHaveBeenCalledOnce();
    expect(mocks.dispatchEmailProviderOperation).not.toHaveBeenCalled();
    expect(ctx.runMutation).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        acceptanceUnknown: false,
        failureCategory: "ineligible",
        retryable: false,
      }),
    );
  });

  it("keeps correction available when contact properties are disabled", async () => {
    mocks.getLoopsReadiness.mockReturnValue({
      confirmationReady: false,
      contactSyncReady: false,
      dispatchEnabled: true,
      teamEnvironment: "production",
      workflowReady: false,
    });
    const ctx = {
      runMutation: vi
        .fn()
        .mockResolvedValueOnce({
          kind: "contactUnsubscribe",
          status: "claimed",
        })
        .mockResolvedValueOnce({ ok: true })
        .mockResolvedValueOnce({
          attemptCount: 1,
          idempotencyExpiresAt: Date.now() + 100_000,
          started: true,
        })
        .mockResolvedValueOnce({
          compensationQueued: false,
          recorded: true,
        }),
      runQuery: vi.fn(async () => ({
        confirmation: null,
        contact: {
          contactName: "Deleted contact",
          leadSegment: "unclassified",
          leadStage: "captured",
          normalizedEmail: "deleted-contact_1",
          providerContactKey: "provider_key",
        },
        operation: {
          kind: "contactUnsubscribe",
          operationId: "operation_1",
        },
        transactionalTemplateKey: null,
        workflow: null,
      })),
    };

    await expect(
      getHandler(processEmailProviderOperation)(ctx, {
        operationId: "operation_1",
      }),
    ).resolves.toEqual({ processed: true });
    expect(mocks.dispatchEmailProviderOperation).toHaveBeenCalledOnce();
  });
});
