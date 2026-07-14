import type { PublicToolEmailWorkflowKey } from "./PublicToolEmailWorkflowKey";
import type { PublicToolGateArtifact } from "./PublicToolGateArtifact";
import type { PublicToolGateMode } from "./PublicToolGateMode";
import type { PublicToolGateValueContract } from "./PublicToolGateValueContract";

type PublicToolGateMetadataBase = {
  mode: PublicToolGateMode;
  outcomeCta: string;
  value: PublicToolGateValueContract;
};

export type PublicToolGateMetadata =
  | (PublicToolGateMetadataBase & {
      artifact: PublicToolGateArtifact;
      mode: "open-result";
    })
  | (PublicToolGateMetadataBase & {
      artifact?: PublicToolGateArtifact;
      mode: "useful-preview";
    })
  | (PublicToolGateMetadataBase & {
      artifact: PublicToolGateArtifact;
      mode: "gated-portability";
    })
  | (PublicToolGateMetadataBase & {
      mode: "email-native";
      workflowKey: PublicToolEmailWorkflowKey;
    });
