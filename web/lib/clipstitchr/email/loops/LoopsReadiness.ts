import type { ClipStitchrDeploymentEnvironment } from "./ClipStitchrDeploymentEnvironment";
import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";

export type LoopsReadiness = Readonly<{
  confirmationReady: boolean;
  contactSyncReady: boolean;
  deploymentEnvironment: ClipStitchrDeploymentEnvironment | null;
  dispatchEnabled: boolean;
  emailNativeReady: boolean;
  reasons: readonly string[];
  teamEnvironment: LoopsTeamEnvironment | null;
  webhookReady: boolean;
  workflowReady: boolean;
}>;
