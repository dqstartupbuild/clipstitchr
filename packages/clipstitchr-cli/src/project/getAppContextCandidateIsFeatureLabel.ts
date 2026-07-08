import type { AppContextStringCandidate } from "./AppContextStringCandidate.js";
import { getAppContextTextIsButton } from "./getAppContextTextIsButton.js";

export function getAppContextCandidateIsFeatureLabel(
  candidate: AppContextStringCandidate,
) {
  const text = candidate.text.trim();

  if (text.length < 2 || text.length > 80 || /[.!?]/.test(text)) {
    return false;
  }

  if (getAppContextTextIsButton(text)) {
    return false;
  }

  if (candidate.name === "heading" || candidate.name === "title") {
    return true;
  }

  if (candidate.name === "name" && /^[A-Z][A-Za-z0-9 '&/-]+$/.test(text)) {
    return true;
  }

  return (
    candidate.source === "text" &&
    /^[A-Z][A-Za-z0-9 '&/-]+$/.test(text) &&
    text.split(/\s+/).length <= 6
  );
}
