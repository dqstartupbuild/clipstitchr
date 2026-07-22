import { describe, expect, it } from "vitest";
import { SWIPR_PEXELS_IMPORT_LIMIT } from "../lib/clipstitchr/constants/swiprPexelsImportLimit";
import { rateLimiter } from "./rateLimiter";

describe("Pexels import rate-limit configuration", () => {
  it("fits the largest supported import inside one global shard", () => {
    const config = rateLimiter.limits?.pexelsImportImagesGlobal;

    expect(config).toBeDefined();
    expect(config?.capacity).toBe(500);
    expect(config?.shards).toBe(4);
    expect((config?.capacity ?? 0) / (config?.shards ?? 1)).toBeGreaterThanOrEqual(
      SWIPR_PEXELS_IMPORT_LIMIT,
    );
  });
});

describe("Hook Lab rate-limit configuration", () => {
  it("triples analysis and script limits", () => {
    expect(rateLimiter.limits?.hookLabPostAnalysis).toMatchObject({
      capacity: 15,
      rate: 90,
    });
    expect(rateLimiter.limits?.hookLabPostAnalysisGlobal).toMatchObject({
      capacity: 600,
      rate: 3000,
    });
    expect(rateLimiter.limits?.hookLabCreativeBrief).toMatchObject({
      capacity: 24,
      rate: 180,
    });
    expect(rateLimiter.limits?.hookLabCreativeBriefGlobal).toMatchObject({
      capacity: 900,
      rate: 6000,
    });
  });
});

describe("public lead and email rate-limit configuration", () => {
  it("defines every ingress boundary before durable email work", () => {
    const requiredLimits = [
      "toolLeadSubmitByClient",
      "toolLeadSubmitByEmail",
      "toolLeadSubmitGlobal",
      "toolLeadInteractionByToken",
      "toolLeadInteractionByClient",
      "toolLeadInteractionGlobal",
      "emailConfirmationSendByEmail",
      "emailConfirmationSendByClient",
      "emailConfirmationSendGlobal",
      "emailConfirmationRedeemByToken",
      "emailConfirmationRedeemByClient",
      "emailConfirmationRedeemGlobal",
      "emailNativeEnrollmentByContact",
      "emailNativeEnrollmentByClient",
      "emailNativeEnrollmentGlobal",
      "courseWorkspaceReadBySession",
      "courseWorkspaceReadGlobal",
      "courseProgressWriteBySession",
      "courseProgressWriteByClient",
      "courseProgressWriteGlobal",
      "courseProgressResetBySession",
      "courseProgressResetGlobal",
      "emailWorkflowEventByContact",
      "emailWorkflowEventGlobal",
      "emailTransactionalByContact",
      "emailTransactionalGlobal",
      "accountTransactionalEmailByOwner",
      "accountTransactionalEmailGlobal",
      "accountContactSyncByOwner",
      "accountContactSyncGlobal",
      "marketingPrivacyDeletionOperator",
    ] as const;

    for (const limit of requiredLimits) {
      expect(rateLimiter.limits?.[limit], limit).toBeDefined();
    }
  });

  it("paces shared Loops traffic below ten requests per second", () => {
    const config = rateLimiter.limits?.loopsProviderRequest;

    expect(config).toMatchObject({
      capacity: 2,
      rate: 8,
    });
    expect(config).not.toHaveProperty("maxReserved");
  });

  it("fits every bounded pending workflow into one confirmation transaction", () => {
    expect(rateLimiter.limits?.emailWorkflowEventByContact?.capacity).toBe(4);
  });
});
