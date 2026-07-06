export function getIsCliSwiprBatchRunId(runId: string) {
  return runId.startsWith("cli:swipr:");
}
