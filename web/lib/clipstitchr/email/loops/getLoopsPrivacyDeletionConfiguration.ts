import { getClipStitchrDeploymentEnvironment } from "./getClipStitchrDeploymentEnvironment";
import { getClipStitchrDeploymentEnvironmentIsVercelCompatible } from "./getClipStitchrDeploymentEnvironmentIsVercelCompatible";
import { hasNonEmptyEnvironmentValue } from "./hasNonEmptyEnvironmentValue";

export function getLoopsPrivacyDeletionConfiguration(
  environment: Readonly<Record<string, string | undefined>>,
) {
  const apiKey = environment.LOOPS_API_KEY?.trim() ?? "";
  const deploymentEnvironment = getClipStitchrDeploymentEnvironment(
    environment.CLIPSTITCHR_DEPLOYMENT_ENVIRONMENT,
  );
  const teamEnvironment = environment.LOOPS_TEAM_ENVIRONMENT?.trim();

  if (
    !hasNonEmptyEnvironmentValue(apiKey) ||
    !deploymentEnvironment ||
    !getClipStitchrDeploymentEnvironmentIsVercelCompatible(
      deploymentEnvironment,
      environment.VERCEL_ENV,
    ) ||
    teamEnvironment !== deploymentEnvironment
  ) {
    return null;
  }

  return { apiKey, teamEnvironment: deploymentEnvironment } as const;
}
