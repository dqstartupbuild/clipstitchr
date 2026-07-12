export async function retryHookLabIdea(id: string) {
  const response = await fetch(
    `/api/hook-lab/ideas/${encodeURIComponent(id)}/retry`,
    { method: "POST" },
  );
  const body = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(body?.message ?? "Unable to try that idea again.");
  }

  return body;
}
