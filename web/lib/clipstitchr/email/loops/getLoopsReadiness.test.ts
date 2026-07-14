import { describe, expect, it } from "vitest";
import { getLoopsReadiness } from "@/lib/clipstitchr/email/loops/getLoopsReadiness";

describe("getLoopsReadiness", () => {
  it("fails closed when provider dispatch is not explicitly enabled", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "production",
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
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "development",
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
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "production",
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
      deploymentEnvironment: "production",
      dispatchEnabled: true,
      emailNativeReady: true,
      teamEnvironment: "production",
      webhookReady: true,
      workflowReady: true,
    });
  });

  it("fails closed when the explicit deployment environment is missing", () => {
    const readiness = getLoopsReadiness({
      NODE_ENV: "production",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "production",
    });

    expect(readiness.deploymentEnvironment).toBeNull();
    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.reasons).toContain(
      "deployment environment is missing or invalid",
    );
  });

  it("fails closed when the explicit deployment environment is invalid", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "preview",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "development",
      LOOPS_DEVELOPMENT_RECIPIENTS: "safe@example.com",
    });

    expect(readiness.deploymentEnvironment).toBeNull();
    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.reasons).toContain(
      "deployment environment is missing or invalid",
    );
  });

  it("uses explicit deployment intent when NODE_ENV is unset", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "development",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "development",
      LOOPS_DEVELOPMENT_RECIPIENTS: "safe@example.com",
    });

    expect(readiness.deploymentEnvironment).toBe("development");
    expect(readiness.dispatchEnabled).toBe(true);
  });

  it("allows a Vercel preview to use the development team when NODE_ENV is production", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "development",
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "development",
      LOOPS_DEVELOPMENT_RECIPIENTS: "safe@example.com",
    });

    expect(readiness.dispatchEnabled).toBe(true);
  });

  it("rejects a Vercel preview wired to the production team", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "production",
      NODE_ENV: "production",
      VERCEL_ENV: "preview",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "production",
    });

    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.reasons).toContain(
      "deployment environment does not match the Vercel environment",
    );
  });

  it("allows a Vercel production deployment wired to production", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "production",
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "production",
    });

    expect(readiness.dispatchEnabled).toBe(true);
  });

  it("rejects a Vercel production deployment wired to development", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "development",
      NODE_ENV: "production",
      VERCEL_ENV: "production",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "development",
      LOOPS_DEVELOPMENT_RECIPIENTS: "safe@example.com",
    });

    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.reasons).toContain(
      "deployment environment does not match the Vercel environment",
    );
  });

  it("fails closed for an unknown non-empty Vercel environment", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "development",
      VERCEL_ENV: "staging",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "development",
      LOOPS_DEVELOPMENT_RECIPIENTS: "safe@example.com",
    });

    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.reasons).toContain(
      "deployment environment does not match the Vercel environment",
    );
  });

  it("rejects a Loops team that differs from explicit deployment intent", () => {
    const readiness = getLoopsReadiness({
      CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "production",
      LOOPS_EMAIL_ENABLED: "true",
      LOOPS_API_KEY: "configured",
      LOOPS_TEAM_ENVIRONMENT: "development",
      LOOPS_DEVELOPMENT_RECIPIENTS: "safe@example.com",
    });

    expect(readiness.dispatchEnabled).toBe(false);
    expect(readiness.reasons).toContain(
      "team environment does not match the deployment environment",
    );
  });
});
