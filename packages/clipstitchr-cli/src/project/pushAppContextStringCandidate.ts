import type { AppContextStringCandidate } from "./AppContextStringCandidate.js";
import { normalizeAppContextText } from "./normalizeAppContextText.js";

export function pushAppContextStringCandidate(
  candidates: AppContextStringCandidate[],
  candidate: AppContextStringCandidate,
) {
  const text = normalizeAppContextText(candidate.text);

  if (text.length < 2 || text.length > 180) {
    return;
  }

  if (/^(true|false|null|undefined)$/i.test(text)) {
    return;
  }

  if (
    /\b(const|export|function|import|let|return|useState)\b|[;{}]|=>|\?\?/.test(
      text,
    )
  ) {
    return;
  }

  candidates.push({
    ...candidate,
    text,
  });
}
