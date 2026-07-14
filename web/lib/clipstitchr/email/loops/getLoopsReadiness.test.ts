import { describe, expect, it } from "vitest";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";

describe("getLoopsReadiness", () => {
  it("fails closed when provider dispatch is not explicitly enabled", () => {
    const readiness = getLoopsReadiness({
      NODE_ENV: "production",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "production",
    });

    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.confirmationReady).toBe(false);
    expect(readiness.emailNativeReady).toBe(false);
  });

  it("requires a separate development-team allowlist", () => {
    const readiness = getLoopsReadiness({
      NODE_ENV: "development",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "development",
    });

    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.reasons).toContain(
      "development recipient allowlist is missing",
    );
  });

  it("enables email-native gates only when every readiness control is explicit", () => {
    const readiness = getLoopsReadiness({
      NODE_ENV: "production",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "production",
      LOOPS_SIGNING_SECRET: "configured",
      LOOPS_WEBHOOKS_READY: "true",
      EMAIL_CONFIRMATION_TOKEN_SECRET: "configured",
      LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID: "configured",
      NEXT_PUBLIC_SITE_URL: "https://clipstitchr.com",
      LOOPS_EMAIL_NATIVE_ENABLED: "true",
      LOOPS_CONTACT_PROPERTIES_READY: "true",
      LOOPS_WORKFLOWS_READY: "true",
    });

    expect(readiness).toMatchObject({
      confirmationReady: true,
      contactSyncReady: true,
      dispatchEnabled: true,
      emailNativeReady: true,
      teamEnvironment: "production",
      webhookReady: true,
      workflowReady: true,
    });
  });

  it("rejects a production app wired to a development Loops team", () => {
    const readiness = getLoopsReadiness({
      NODE_ENV: "production",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "development",
      LOOPS_DEVELOPMENT_RECIPIENTS: "safe@example.com",
    });

    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.reasons).toContain(
      "team environment does not match the app environment",
    );
  });
});
