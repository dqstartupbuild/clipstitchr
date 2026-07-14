import { describe, expect, it } from "vitest";
import { getLoopsPrivacyDeletionConfiguration } from "./getLoopsPrivacyDeletionConfiguration";

describe("getLoopsPrivacyDeletionConfiguration", () => {
  it("fails closed without an explicit deployment environment", () => {
    expect(
      getLoopsPrivacyDeletionConfiguration({
        LOOPS_API_KEY: "configured",
        LOOPS_TEAM_ENVIRONMENT: "production",
      }),
    ).toBeNull();
  });

  it("fails closed when the Loops team does not match the deployment", () => {
    expect(
      getLoopsPrivacyDeletionConfiguration({
        CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "production",
        LOOPS_API_KEY: "configured",
        LOOPS_TEAM_ENVIRONMENT: "development",
      }),
    ).toBeNull();
  });

  it("fails closed when a Vercel preview claims production provider identity", () => {
    expect(
      getLoopsPrivacyDeletionConfiguration({
        CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "production",
        LOOPS_API_KEY: "configured",
        LOOPS_TEAM_ENVIRONMENT: "production",
        VERCEL_ENV: "preview",
      }),
    ).toBeNull();
  });

  it("allows provider deletion while email dispatch is disabled", () => {
    expect(
      getLoopsPrivacyDeletionConfiguration({
        CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "development",
        LOOPS_API_KEY: " configured ",
        LOOPS_EMAIL_ENABLED: "false",
        LOOPS_TEAM_ENVIRONMENT: "development",
      }),
    ).toEqual({
      apiKey: "configured",
      teamEnvironment: "development",
    });
  });
});
