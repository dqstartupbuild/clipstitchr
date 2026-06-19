export type GenerateStitchrBatchResult = {
  batchDate: string;
  count: number;
  message?: string;
  runId: string;
  status: string;
  taskIds: string[];
};

type GenerateStitchrBatchOptions = {
  templateId?: string;
};

export async function generateStitchrBatch(
  options: GenerateStitchrBatchOptions = {},
) {
  const templateId = options.templateId?.trim();
  const response = await fetch("/api/stitchr/batch/generate", {
    ...(templateId
      ? {
          body: JSON.stringify({ templateId }),
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
