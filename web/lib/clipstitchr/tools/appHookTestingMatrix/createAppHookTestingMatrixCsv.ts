import { createCsvText } from "@/lib/clipstitchr/tools/csv/createCsvText";
import type { AppHookTestingMatrixResult } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingMatrixResult";

export function createAppHookTestingMatrixCsv(
  result: AppHookTestingMatrixResult,
) {
  return createCsvText([
    [
      "cell",
      "stage",
      "changed_variable",
      "hook",
      "visual",
      "cta",
      "instruction",
      "stable_audience",
      "stable_offer",
    ],
    ...result.cells.map((cell, index) => [
      String(index + 1),
      cell.stage,
      cell.changedVariable,
      cell.hook,
      cell.visual,
      cell.cta,
      cell.instruction,
      result.audience,
      result.offer,
    ]),
  ]);
}
