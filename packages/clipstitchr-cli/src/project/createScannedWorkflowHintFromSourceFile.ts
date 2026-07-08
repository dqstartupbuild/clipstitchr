import { readFile } from "node:fs/promises";
import { basename, relative } from "node:path";
import { extractAppContextStringCandidates } from "./extractAppContextStringCandidates.js";
import { createAppContextRouteTitle } from "./createAppContextRouteTitle.js";
import { getAppContextCandidateIsFeatureLabel } from "./getAppContextCandidateIsFeatureLabel.js";
import { getAppContextCandidateIsInput } from "./getAppContextCandidateIsInput.js";
import { getAppContextRoutePathForFile } from "./getAppContextRoutePathForFile.js";
import { getAppContextTextIsButton } from "./getAppContextTextIsButton.js";
import { getUniqueAppContextStrings } from "./getUniqueAppContextStrings.js";
import { humanizeAppContextName } from "./humanizeAppContextName.js";
import type { ScannedWorkflowHint } from "./ScannedWorkflowHint.js";

export async function createScannedWorkflowHintFromSourceFile(
  projectCwd: string,
  filePath: string,
): Promise<ScannedWorkflowHint | null> {
  const source = await readFile(filePath, "utf8");
  const candidates = extractAppContextStringCandidates(source);
  const relativeFilePath = relative(projectCwd, filePath);
  const routePath = getAppContextRoutePathForFile(relativeFilePath);
  const buttons = getUniqueAppContextStrings(
    candidates
      .filter(
        (candidate) =>
          candidate.text.length <= 90 &&
          !/[.!?]/.test(candidate.text) &&
          getAppContextTextIsButton(candidate.text),
      )
      .map((candidate) => candidate.text),
    16,
  );
  const inputs = getUniqueAppContextStrings(
    candidates
      .filter(getAppContextCandidateIsInput)
      .map((candidate) => candidate.text),
    16,
  );
  const featureLabels = getUniqueAppContextStrings(
    candidates
      .filter(getAppContextCandidateIsFeatureLabel)
      .map((candidate) => candidate.text),
    16,
  ).filter(
    (value) =>
      !buttons.some((button) => button.toLowerCase() === value.toLowerCase()) &&
      !inputs.some((input) => input.toLowerCase() === value.toLowerCase()),
  );
  const actions = getUniqueAppContextStrings(
    [...featureLabels, ...buttons, ...inputs].filter(
      (value) => value.length <= 120,
    ),
    20,
  );

  if (
    !actions.length &&
    !buttons.length &&
    !featureLabels.length &&
    !inputs.length
  ) {
    return null;
  }

  return {
    actions,
    buttons,
    featureLabels,
    inputs,
    ...(routePath ? { routePath } : {}),
    sourceFiles: [relativeFilePath],
    summary: `Visible workflow hints from ${relativeFilePath}.`,
    title: routePath
      ? createAppContextRouteTitle(routePath)
      : humanizeAppContextName(basename(relativeFilePath)),
  } satisfies ScannedWorkflowHint;
}
