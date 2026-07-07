import type { AppContextStringCandidate } from "./AppContextStringCandidate.js";

export function getAppContextCandidateIsInput(
  candidate: AppContextStringCandidate,
) {
  const text = candidate.text.toLowerCase();

  if (candidate.name === "label") {
    return true;
  }

  if (candidate.name === "placeholder") {
    return candidate.text.length <= 50 && !/[.!?]/.test(candidate.text);
  }

  if (candidate.source === "attribute") {
    return false;
  }

  if (candidate.text.length > 70 || /[.!?]/.test(candidate.text)) {
    return false;
  }

  return /\b(email|password|name|title|caption|description|url|website|search|prompt|main goal|tone|hooks? to|learn from|avoid|audience|keyword|voice|style|topic|product)\b/.test(
    text,
  );
}
