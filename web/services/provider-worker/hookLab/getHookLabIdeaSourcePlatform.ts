import type { HookLabIdeaDocument } from "./HookLabIdeaDocument";

export function getHookLabIdeaSourcePlatform(idea: HookLabIdeaDocument) {
  if (idea.sourcePlatform === "tiktok" || idea.sourcePlatform === "instagram") {
    return idea.sourcePlatform;
  }

  throw new Error("Hook Lab social idea is missing its platform.");
}
