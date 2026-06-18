export type GenerateStitchrBatchResult = {
  automationDate: string;
  count: number;
  message?: string;
  runId: string;
  status: string;
  taskIds: string[];
};

export async function generateStitchrBatch() {
  const response = await fetch("/api/stitchr/batch/generate", {
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
