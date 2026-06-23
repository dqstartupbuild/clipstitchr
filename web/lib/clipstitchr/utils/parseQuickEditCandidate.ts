import type { QuickEditCandidate } from "@/lib/clipstitchr/types/QuickEditCandidate";
import { parseQuickEditCandidateSignals } from "@/lib/clipstitchr/utils/parseQuickEditCandidateSignals";

function parseCandidateNumber(value: unknown) {
  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
}

function parseCandidateText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function clampCandidateConfidence(value: unknown) {
  const confidence = parseCandidateNumber(value);

  if (confidence === undefined) {
    return undefined;
  }

  return Math.max(0, Math.min(1, confidence));
}

export function parseQuickEditCandidate(
  value: unknown,
): QuickEditCandidate | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const start = parseCandidateNumber(source.start);
  const end = parseCandidateNumber(source.end);
  const confidence = clampCandidateConfidence(source.confidence);

  if (
    start === undefined ||
    end === undefined ||
    confidence === undefined ||
    start < 0 ||
    end <= start
  ) {
    return null;
  }

  const signals = parseQuickEditCandidateSignals(source.signals);

  if (!signals.length) {
    return null;
  }

  const reason = parseCandidateText(source.reason, 180);
  const stats = parseCandidateText(source.stats, 180);

  return {
    start,
    end,
    confidence,
    signals,
    ...(reason ? { reason } : {}),
    ...(stats ? { stats } : {}),
  };
}
