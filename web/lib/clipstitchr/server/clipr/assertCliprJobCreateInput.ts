import type { CliprJobCreateInput } from "@/lib/clipstitchr/server/clipr/CliprJobCreateInput";

export function assertCliprJobCreateInput(input: CliprJobCreateInput) {
  if (!input.productId) {
    throw new Error("Choose a saved product first.");
  }

  if (input.generationMode === "demo") {
    if (!input.demoClipId) {
      throw new Error("Choose a demo video first.");
    }

    return;
  }

  if (!input.avatarId) {
    throw new Error("Choose an avatar first.");
  }
}
