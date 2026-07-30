import type { SocialPublishJobInput } from "./SocialPublishJobInput";

export function parseSocialPublishJobInput(
  inputSnapshotJson: string,
): SocialPublishJobInput {
  const value = JSON.parse(inputSnapshotJson) as Record<string, unknown>;

  if (
    typeof value.postId !== "string" ||
    !value.postId ||
    typeof value.targetId !== "string" ||
    !value.targetId
  ) {
    throw new Error("The social publishing job input is invalid.");
  }

  return {
    postId: value.postId,
    targetId: value.targetId,
  };
}
