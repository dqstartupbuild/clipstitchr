import type { ClipStitchrDeploymentEnvironment } from "./ClipStitchrDeploymentEnvironment";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";

export type AccountEmailReadiness = Readonly<{
  deploymentEnvironment: ClipStitchrDeploymentEnvironment | null;
  dispatchEnabled: boolean;
  reasons: readonly string[];
  teamEnvironment: LoopsTeamEnvironment | null;
  templatesReady: boolean;
}>;
