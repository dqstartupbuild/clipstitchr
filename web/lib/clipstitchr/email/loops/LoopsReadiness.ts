import type { LoopsTeamEnvironment } from "./LoopsTeamEnvironment";

export type LoopsReadiness = Readonly<{
  confirmationReady: boolean;
  contactSyncReady: boolean;
  dispatchEnabled: boolean;
  emailNativeReady: boolean;
  reasons: readonly string[];
  teamEnvironment: LoopsTeamEnvironment | null;
  webhookReady: boolean;
  workflowReady: boolean;
}>;
