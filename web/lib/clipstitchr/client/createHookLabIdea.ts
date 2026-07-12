import type { HookLabIdeaScope } from "@/lib/clipstitchr/types/HookLabIdeaScope";

type CreateHookLabIdeaInput = {
  hookOptionId?: string;
  productId?: string;
  scope: HookLabIdeaScope;
  stitchId?: string;
  value?: string;
};

export async function createHookLabIdea(input: CreateHookLabIdeaInput) {
  const response = await fetch("/api/hook-lab/ideas", {
    body: JSON.stringify(input),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const body = (await response.json().catch(() => null)) as {
    id?: string;
    message?: string;
  } | null;

  if (!response.ok) {
    throw new Error(body?.message ?? "Unable to save that idea.");
  }

  return body;
}
