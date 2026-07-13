import type { ShortFormAuditResponses } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResponses";
import { shortFormAuditQuestions } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditQuestions";

export const defaultShortFormAuditResponses: ShortFormAuditResponses =
  Object.fromEntries(
    shortFormAuditQuestions.map((question) => [question.id, 5]),
  );
