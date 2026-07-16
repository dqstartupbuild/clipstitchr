import { describe, expect, it } from "vitest";
import { getLoopsAccountEmailReadiness } from "./getLoopsAccountEmailReadiness";

const readyEnvironment = {
  CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT: "production",
  LOOPS_ACCOUNT_CREATED_TRANSACTIONAL_ID: "txn_account",
  LOOPS_ACCOUNT_EMAIL_ENABLED: "true",
  LOOPS_API_KEY: "api_key",
  LOOPS_CREDITS_UPDATED_TRANSACTIONAL_ID: "txn_credits",
  LOOPS_PAYMENT_ALERT_TRANSACTIONAL_ID: "txn_payment",
  LOOPS_SUBSCRIPTION_STATUS_TRANSACTIONAL_ID: "txn_subscription",
  LOOPS_TEAM_ENVIRONMENT: "production",
  VERCEL_ENV: "production",
} as const;

describe("getLoopsAccountEmailReadiness", () => {
  it("enables the isolated account channel when every exact guard is ready", () => {
    expect(getLoopsAccountEmailReadiness(readyEnvironment)).toMatchObject({
      dispatchEnabled: true,
      reasons: [],
      templatesReady: true,
    });
  });

  it("does not depend on the paused marketing email gate", () => {
    expect(
      getLoopsAccountEmailReadiness({
        ...readyEnvironment,
        LOOPS_EMAIL_ENABLED: "false",
        LOOPS_EMAIL_NATIVE_ENABLED: "false",
      }).dispatchEnabled,
    ).toBe(true);
  });

  it("fails closed when a template or deployment match is missing", () => {
    const result = getLoopsAccountEmailReadiness({
      ...readyEnvironment,
      LOOPS_PAYMENT_ALERT_TRANSACTIONAL_ID: "",
      LOOPS_TEAM_ENVIRONMENT: "development",
    });

    expect(result.dispatchEnabled).toBe(false);
    expect(result.reasons).toEqual(
      expect.arrayContaining([
        "team environment does not match deployment",
        "one or more account templates are missing",
      ]),
    );
  });
});
