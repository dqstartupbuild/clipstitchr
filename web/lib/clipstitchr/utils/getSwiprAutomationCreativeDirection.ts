import { swiprAutomationCreativeDirections } from "@/lib/clipstitchr/constants/swiprAutomationCreativeDirections";

export function getSwiprAutomationCreativeDirection(draftIndex: number) {
  const normalizedIndex =
    Number.isFinite(draftIndex) && draftIndex > 0
      ? Math.floor(draftIndex)
      : 1;

  return (
    swiprAutomationCreativeDirections[
      (normalizedIndex - 1) % swiprAutomationCreativeDirections.length
    ] ?? swiprAutomationCreativeDirections[0]
  );
}
