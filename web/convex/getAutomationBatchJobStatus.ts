type AutomationBatchTask = {
  status: string;
};

export function getAutomationBatchJobStatus(tasks: AutomationBatchTask[]) {
  return tasks.some((task) => task.status === "running")
    ? "running"
    : "queued";
}
