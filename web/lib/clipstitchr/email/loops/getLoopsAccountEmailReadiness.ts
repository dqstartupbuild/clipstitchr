import type { AccountEmailReadiness } from "./AccountEmailReadiness";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";
import { getClipStitchrDeploymentEnvironment } from "./getClipStitchrDeploymentEnvironment";
import { getClipStitchrDeploymentEnvironmentIsVercelCompatible } from "./getClipStitchrDeploymentEnvironmentIsVercelCompatible";
import { hasNonEmptyEnvironmentValue } from "./hasNonEmptyEnvironmentValue";

const accountTemplateEnvironmentKeys = [
  "LOOPS_ACCOUNT_CREATED_TRANSACTIONAL_ID",
  "LOOPS_SUBSCRIPTION_STATUS_TRANSACTIONAL_ID",
  "LOOPS_CREDITS_UPDATED_TRANSACTIONAL_ID",
  "LOOPS_PAYMENT_ALERT_TRANSACTIONAL_ID",
] as const;

export function getLoopsAccountEmailReadiness(
  environment: Readonly<Record<string, string | undefined>>,
): AccountEmailReadiness {
  const reasons: string[] = [];
  const configuredTeamEnvironment = environment.LOOPS_TEAM_ENVIRONMENT?.trim();
  const teamEnvironment: LoopsTeamEnvironment | null =
    configuredTeamEnvironment === "development" ||
    configuredTeamEnvironment === "production"
      ? configuredTeamEnvironment
      : null;
  const deploymentEnvironment = getClipStitchrDeploymentEnvironment(
    environment.CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT,
  );
  const deploymentMatchesVercel =
    deploymentEnvironment !== null &&
    getClipStitchrDeploymentEnvironmentIsVercelCompatible(
      deploymentEnvironment,
      environment.VERCEL_ENV,
    );
  const teamMatchesDeployment =
    deploymentEnvironment !== null &&
    teamEnvironment !== null &&
    deploymentEnvironment === teamEnvironment;
  const templatesReady = accountTemplateEnvironmentKeys.every((key) =>
    hasNonEmptyEnvironmentValue(environment[key]),
  );

  if (environment.LOOPS_ACCOUNT_EMAIL_ENABLED !== "true") {
    reasons.push("account email dispatch is disabled");
  }
  if (!hasNonEmptyEnvironmentValue(environment.LOOPS_API_KEY)) {
    reasons.push("API key is missing");
  }
  if (!deploymentEnvironment) {
    reasons.push("deployment environment is missing or invalid");
  } else if (!deploymentMatchesVercel) {
    reasons.push("deployment environment does not match Vercel");
  }
  if (!teamEnvironment) {
    reasons.push("team environment is missing or invalid");
  } else if (!teamMatchesDeployment) {
    reasons.push("team environment does not match deployment");
  }
  if (
    teamEnvironment === "development" &&
    !hasNonEmptyEnvironmentValue(environment.LOOPS_DEVELOPMENT_RECIPIENTS)
  ) {
    reasons.push("development recipient allowlist is missing");
  }
  if (!templatesReady) {
    reasons.push("one or more account templates are missing");
  }

  return {
    deploymentEnvironment,
    dispatchEnabled:
      environment.LOOPS_ACCOUNT_EMAIL_ENABLED === "true" &&
      hasNonEmptyEnvironmentValue(environment.LOOPS_API_KEY) &&
      deploymentMatchesVercel &&
      teamMatchesDeployment &&
      templatesReady &&
      (teamEnvironment !== "development" ||
        hasNonEmptyEnvironmentValue(environment.LOOPS_DEVELOPMENT_RECIPIENTS)),
    reasons,
    teamEnvironment,
    templatesReady,
  };
}
