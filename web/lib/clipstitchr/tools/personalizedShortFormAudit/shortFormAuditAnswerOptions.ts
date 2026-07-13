import type { ShortFormAuditScore } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditScore";

export const shortFormAuditAnswerOptions: Array<{
  label: string;
  score: ShortFormAuditScore;
}> = [
  { label: "Not yet — 0 points", score: 0 },
  { label: "Partly — 5 points", score: 5 },
  { label: "Consistently — 10 points", score: 10 },
];
