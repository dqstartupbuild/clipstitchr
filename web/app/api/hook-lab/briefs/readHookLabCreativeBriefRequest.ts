import type { HookLabDestinationTool } from "@/lib/clipstitchr/types/HookLabDestinationTool";

export function readHookLabCreativeBriefRequest(value: unknown) {
  const body =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const destinationTool = body.destinationTool;
  const productId = typeof body.productId === "string" ? body.productId.trim() : "";
  const sourcePostId =
    typeof body.sourcePostId === "string" ? body.sourcePostId.trim() : "";
  const hookTemplateId =
    typeof body.hookTemplateId === "string"
      ? body.hookTemplateId.trim().slice(0, 120)
      : undefined;

  if (
    destinationTool !== "clipr" &&
    destinationTool !== "stitchr" &&
    destinationTool !== "swipr"
  ) {
    throw new Error("Choose Clipr, Stitchr, or Swipr.");
  }

  if (!productId) {
    throw new Error("Choose a saved product first.");
  }

  if (!sourcePostId) {
    throw new Error("Choose a completed Hook Lab report.");
  }

  return {
    destinationTool: destinationTool as HookLabDestinationTool,
    hookTemplateId,
    productId,
    sourcePostId,
  };
}
