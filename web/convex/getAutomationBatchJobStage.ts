type AutomationBatchTask = {
  stage: string;
  status: string;
};

export function getAutomationBatchJobStage(tasks: AutomationBatchTask[]) {
  const runningTask = tasks.find((task) => task.status === "running");

  if (runningTask) {
    return runningTask.stage;
  }

  return tasks[0]?.stage ?? "queued";
}
