import { collectAppContextSourceFiles } from "./collectAppContextSourceFiles.js";
import { createScannedWorkflowHintFromSourceFile } from "./createScannedWorkflowHintFromSourceFile.js";
import { mergeScannedWorkflowHints } from "./mergeScannedWorkflowHints.js";
import type { ScannedWorkflowHint } from "./ScannedWorkflowHint.js";

export async function scanProjectWorkflowHints(projectCwd: string) {
  const files = await collectAppContextSourceFiles(projectCwd);
  const hints = await Promise.all(
    files.map((file) => createScannedWorkflowHintFromSourceFile(projectCwd, file)),
  );

  return mergeScannedWorkflowHints(
    hints.filter((hint): hint is ScannedWorkflowHint => hint !== null),
  );
}
