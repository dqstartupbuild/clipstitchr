import type { AppContextStringCandidate } from "./AppContextStringCandidate.js";
import { pushAppContextStringCandidate } from "./pushAppContextStringCandidate.js";

export function extractAppContextStringCandidates(source: string) {
  const candidates: AppContextStringCandidate[] = [];
  const attributeExpressionRegex =
    /\b(aria-label|label|title|placeholder|alt|message)\s*=\s*\{\s*["'`]([^"'`]+)["'`]\s*\}/g;
  const attributeRegex =
    /\b(aria-label|label|title|placeholder|alt|message)\s*=\s*["']([^"']+)["']/g;
  const objectRegex =
    /\b(label|title|name|message|heading|description|text)\s*:\s*["'`]([^"'`]+)["'`]/g;
  const textNodeRegex = />\s*([^<>{}]{2,260})\s*</g;

  for (const match of source.matchAll(attributeExpressionRegex)) {
    pushAppContextStringCandidate(candidates, {
      name: match[1],
      source: "attribute",
      text: match[2],
    });
  }

  for (const match of source.matchAll(attributeRegex)) {
    pushAppContextStringCandidate(candidates, {
      name: match[1],
      source: "attribute",
      text: match[2],
    });
  }

  for (const match of source.matchAll(objectRegex)) {
    pushAppContextStringCandidate(candidates, {
      name: match[1],
      source: "object",
      text: match[2],
    });
  }

  for (const match of source.matchAll(textNodeRegex)) {
    pushAppContextStringCandidate(candidates, {
      source: "text",
      text: match[1],
    });
  }

  return candidates;
}
