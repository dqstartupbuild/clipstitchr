import type { ClipStitchrDeploymentEnvironment } from "./ClipStitchrDeploymentEnvironment";

export function getClipStitchrDeploymentEnvironment(
  value: string | undefined,
): ClipStitchrDeploymentEnvironment | null {
  const normalizedValue = value?.trim();

  return normalizedValue === "development" || normalizedValue === "production"
    ? normalizedValue
    : null;
}
