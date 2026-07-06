type AutomationBatchTask = {
  status: string;
};

const terminalTaskStatuses = new Set([
  "canceled",
  "completed",
  "failed",
  "skipped",
]);

export function getAutomationBatchJobProgress(tasks: AutomationBatchTask[]) {
  if (tasks.length === 0) {
    return undefined;
  }

  const finishedCount = tasks.filter((task) =>
    terminalTaskStatuses.has(task.status),
  ).length;

  return finishedCount / tasks.length;
}
