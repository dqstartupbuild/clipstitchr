import type { StudioClipsCostStage } from "./StudioClipsCostStage";

export type StudioClipsCostGateGateway = {
  assertOwnerAndGlobalAllowed: (input: {
    attempt: number;
    ownerId: string;
    productId: string;
    stage: StudioClipsCostStage;
    taskId: string;
  }) => Promise<void>;
};
