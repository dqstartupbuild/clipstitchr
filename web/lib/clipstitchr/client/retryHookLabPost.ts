export async function retryHookLabPost(id: string) {
  const response = await fetch(
    `/api/hook-lab/posts/${encodeURIComponent(id)}/retry`,
    { method: "POST" },
  );
  const payload = (await response.json().catch(() => ({}))) as {
    message?: string;
  };

  if (!response.ok) {
    throw new Error(
      payload.message || "Unable to analyze that post again.",
    );
  }
}
