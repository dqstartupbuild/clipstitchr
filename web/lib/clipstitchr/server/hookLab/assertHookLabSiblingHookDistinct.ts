import { getHookLabOverlappingSiblingHook } from "./getHookLabOverlappingSiblingHook";

export function assertHookLabSiblingHookDistinct({
  candidateText,
  siblingHooks,
}: {
  candidateText: string;
  siblingHooks: string[];
}) {
  if (getHookLabOverlappingSiblingHook({ candidateText, siblingHooks })) {
    throw new Error("The hook overlaps another version in this batch.");
  }

  return candidateText.trim();
}
