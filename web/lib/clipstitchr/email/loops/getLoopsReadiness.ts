import type { LoopsReadiness } from "./LoopsReadiness";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";
import { hasNonEmptyEnvironmentValue } from "./hasNonEmptyEnvironmentValue";

export function getLoopsReadiness(
  environment: Readonly<Record<string, string | undefined>>,
): LoopsReadiness {
  const reasons: string[] = [];
  const configuredTeamEnvironment = environment.LOOPS_TEAM_ENVIRONMENT?.trim();
  const teamEnvironment: LoopsTeamEnvironment | null =
    configuredTeamEnvironment === "development" ||
    configuredTeamEnvironment === "production"
      ? configuredTeamEnvironment
      : null;
  const expectedTeamEnvironment =
    environment.NODE_ENV === "production" ? "production" : "development";
  const dispatchRequested = environment.LOOPS_EMAIL_ENABLED === "true";

  if (!dispatchRequested) reasons.push("provider dispatch is disabled");
  if (!hasNonEmptyEnvironmentValue(environment.LOOPS_API_KEY)) {
    reasons.push("API key is missing");
  }
  if (!teamEnvironment) reasons.push("team environment is missing or invalid");
  if (teamEnvironment && teamEnvironment !== expectedTeamEnvironment) {
    reasons.push("team environment does not match the app environment");
  }
  if (
    teamEnvironment === "development" &&
    !hasNonEmptyEnvironmentValue(environment.LOOPS_DEVELOPMENT_RECIPIENTS)
  ) {
    reasons.push("development recipient allowlist is missing");
  }

  const dispatchEnabled =
    dispatchRequested &&
    hasNonEmptyEnvironmentValue(environment.LOOPS_API_KEY) &&
    teamEnvironment === expectedTeamEnvironment &&
    (teamEnvironment !== "development" ||
      hasNonEmptyEnvironmentValue(environment.LOOPS_DEVELOPMENT_RECIPIENTS));
  const webhookReady =
    hasNonEmptyEnvironmentValue(environment.LOOPS_SIGNING_SECRET) &&
    environment.LOOPS_WEBHOOKS_READY === "true";
  const contactSyncReady =
    dispatchEnabled && environment.LOOPS_CONTACT_PROPERTIES_READY === "true";
  const confirmationReady =
    dispatchEnabled &&
    hasNonEmptyEnvironmentValue(environment.EMAIL_CONFIRMATION_TOKEN_SECRET) &&
    hasNonEmptyEnvironmentValue(
      environment.LOOPS_EMAIL_CONFIRMATION_TRANSACTIONAL_ID,
    ) &&
    (hasNonEmptyEnvironmentValue(environment.NEXT_PUBLIC_SITE_URL) ||
      hasNonEmptyEnvironmentValue(environment.SITE_URL));
  const workflowReady =
    contactSyncReady &&
    webhookReady &&
    environment.LOOPS_WORKFLOWS_READY === "true";
  const emailNativeReady =
    confirmationReady &&
    workflowReady &&
    environment.LOOPS_EMAIL_NATIVE_ENABLED === "true";

  return {
    confirmationReady,
    contactSyncReady,
    dispatchEnabled,
    emailNativeReady,
    reasons,
    teamEnvironment,
    webhookReady,
    workflowReady,
  };
}
