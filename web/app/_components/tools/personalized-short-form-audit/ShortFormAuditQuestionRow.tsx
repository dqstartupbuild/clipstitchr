import type { ShortFormAuditQuestion } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditQuestion";
import type { ShortFormAuditScore } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditScore";
import { shortFormAuditAnswerOptions } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditAnswerOptions";

type ShortFormAuditQuestionRowProps = {
  onChange: (score: ShortFormAuditScore) => void;
  question: ShortFormAuditQuestion;
  score: ShortFormAuditScore;
};

export function ShortFormAuditQuestionRow({
  onChange,
  question,
  score,
}: ShortFormAuditQuestionRowProps) {
  return (
    <label
      className="grid gap-3 rounded-lg border border-border bg-surface-elevated p-4 text-sm font-semibold text-text-primary"
      htmlFor={question.id}
    >
      {question.prompt}
      <select
        className="h-11 rounded-lg border border-border bg-surface px-3 text-sm font-bold text-text-primary"
        id={question.id}
        value={score}
        onChange={(event) =>
          onChange(Number(event.currentTarget.value) as ShortFormAuditScore)
        }
      >
        {shortFormAuditAnswerOptions.map((option) => (
          <option key={option.score} value={option.score}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
