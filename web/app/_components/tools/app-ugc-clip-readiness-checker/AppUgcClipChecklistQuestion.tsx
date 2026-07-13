import type { AppUgcClipAnswer } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswer";
import type { AppUgcClipQuestion } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipQuestion";
import { appUgcClipAnswerOptions } from "@/lib/clipstitchr/tools/appUgcClipReadiness/appUgcClipAnswerOptions";

type AppUgcClipChecklistQuestionProps = {
  answer: AppUgcClipAnswer;
  isApplicable: boolean;
  onAnswer: (answer: AppUgcClipAnswer) => void;
  question: AppUgcClipQuestion;
};

export function AppUgcClipChecklistQuestion({
  answer,
  isApplicable,
  onAnswer,
  question,
}: AppUgcClipChecklistQuestionProps) {
  return (
    <fieldset
      className="rounded-lg border border-border bg-surface-elevated p-4"
      disabled={!isApplicable}
    >
      <legend className="px-1 text-sm font-bold leading-6 text-text-primary">
        {question.prompt}
      </legend>
      {!isApplicable ? (
        <p className="mt-2 text-sm text-text-tertiary">
          Not applicable to this silent clip role.
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {appUgcClipAnswerOptions.map((option) => (
            <label
              className={[
                "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold",
                answer === option.value
                  ? "border-accent bg-accent/10 text-accent-dark"
                  : "border-border bg-white text-text-secondary",
              ].join(" ")}
              key={option.value}
            >
              <input
                type="radio"
                name={`app-ugc-clip-${question.id}`}
                checked={answer === option.value}
                value={option.value}
                onChange={() => onAnswer(option.value)}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
