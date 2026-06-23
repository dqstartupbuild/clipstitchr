import type { AutomationStitchrColorChoice } from "@/lib/clipstitchr/types/AutomationStitchrColorChoice";
import type { AutomationStitchrTextStyleChoice } from "@/lib/clipstitchr/types/AutomationStitchrTextStyleChoice";
import { getBrowserTimeZone } from "@/lib/clipstitchr/client/getBrowserTimeZone";

export type GenerateStitchrBatchResult = {
  batchDate: string;
  count: number;
  hookPlanCount?: number;
  hookPlanStatus?: string;
  message?: string;
  providerDispatchStatus?: string;
  runId: string;
  status: string;
  taskIds: string[];
};

export type GenerateStitchrBatchOptions = {
  stitchrTextBackgroundColorChoice?: AutomationStitchrColorChoice;
  stitchrTextColorChoice?: AutomationStitchrColorChoice;
  stitchrTextStrokeColorChoice?: AutomationStitchrColorChoice;
  stitchrTextStyleChoice?: AutomationStitchrTextStyleChoice;
  templateId?: string;
  timeZone?: string;
};

export async function generateStitchrBatch(
  options: GenerateStitchrBatchOptions = {},
) {
  const templateId = options.templateId?.trim();
  const timeZone = options.timeZone?.trim() || getBrowserTimeZone();
  const body = {
    ...(options.stitchrTextBackgroundColorChoice
      ? {
          stitchrTextBackgroundColorChoice:
            options.stitchrTextBackgroundColorChoice,
        }
      : {}),
    ...(options.stitchrTextColorChoice
      ? { stitchrTextColorChoice: options.stitchrTextColorChoice }
      : {}),
    ...(options.stitchrTextStrokeColorChoice
      ? { stitchrTextStrokeColorChoice: options.stitchrTextStrokeColorChoice }
      : {}),
    ...(options.stitchrTextStyleChoice
      ? { stitchrTextStyleChoice: options.stitchrTextStyleChoice }
      : {}),
    ...(templateId ? { templateId } : {}),
    ...(timeZone ? { timeZone } : {}),
  };
  const hasBody = Object.keys(body).length > 0;
  const response = await fetch("/api/stitchr/batch/generate", {
    ...(hasBody
      ? {
          body: JSON.stringify(body),
          headers: { "content-type": "application/json" },
        }
      : {}),
    method: "POST",
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    throw new Error(body?.message ?? "Unable to generate Stitch drafts.");
  }

  return (await response.json()) as GenerateStitchrBatchResult;
}
