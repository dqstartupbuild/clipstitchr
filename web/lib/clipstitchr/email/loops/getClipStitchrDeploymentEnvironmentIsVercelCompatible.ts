import type { ClipStitchrDeploymentEnvironment } from "./ClipStitchrDeploymentEnvironment";

export function getClipStitchrDeploymentEnvironmentIsVercelCompatible(
  deploymentEnvironment: ClipStitchrDeploymentEnvironment,
  vercelEnvironment: string | undefined,
) {
  const normalizedVercelEnvironment = vercelEnvironment?.trim();

  if (!normalizedVercelEnvironment) return true;
  if (normalizedVercelEnvironment === "production") {
    return deploymentEnvironment === "production";
  }
  if (
    normalizedVercelEnvironment === "preview" ||
    normalizedVercelEnvironment === "development"
  ) {
    return deploymentEnvironment === "development";
  }

  return false;
}
