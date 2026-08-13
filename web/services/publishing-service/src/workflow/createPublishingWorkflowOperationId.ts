export const createPublishingWorkflowOperationId = (
  attemptId: string,
  checkpointVersion: number,
  phase: string,
): string => `workflow:${attemptId}:v${checkpointVersion + 1}:${phase}`;
