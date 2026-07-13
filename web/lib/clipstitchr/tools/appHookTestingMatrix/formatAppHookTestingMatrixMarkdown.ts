import type { AppHookTestingMatrixResult } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingMatrixResult";

export function formatAppHookTestingMatrixMarkdown(
  result: AppHookTestingMatrixResult,
) {
  return [
    "# App Hook Testing Matrix",
    "",
    `Stable audience: ${result.audience}`,
    `Stable offer: ${result.offer}`,
    `Stable CTA: ${result.stableCta}`,
    "",
    ...result.cells.flatMap((cell, index) => [
      `## Cell ${index + 1}: ${cell.stage}`,
      `Changed variable: ${cell.changedVariable}`,
      `Hook: ${cell.hook}`,
      `Visual: ${cell.visual}`,
      `CTA: ${cell.cta}`,
      cell.instruction,
      "",
    ]),
  ]
    .join("\n")
    .trim();
}
