import { readPostBridgeClientErrorMessage } from "@/lib/clipstitchr/client/readPostBridgeClientErrorMessage";
import type { PostBridgeBatchJobInput } from "@/lib/clipstitchr/types/PostBridgeBatchJobInput";

export async function submitPostBridgeBatch(input: PostBridgeBatchJobInput) {
  const response = await fetch("/api/post-bridge/batches", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(
      await readPostBridgeClientErrorMessage(
        response,
        "Unable to start this scheduling batch.",
      ),
    );
  }

  return (await response.json()) as { jobId: string };
}
