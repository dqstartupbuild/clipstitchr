type AutomationTaskLike = {
  inputSnapshotJson: string;
};

export function getProductNameFromAutomationTasks(
  tasks: AutomationTaskLike[],
) {
  for (const task of tasks) {
    try {
      const snapshot = JSON.parse(task.inputSnapshotJson) as {
        productName?: unknown;
      };

      if (typeof snapshot.productName === "string" && snapshot.productName) {
        return snapshot.productName;
      }
    } catch {
      continue;
    }
  }

  return undefined;
}
