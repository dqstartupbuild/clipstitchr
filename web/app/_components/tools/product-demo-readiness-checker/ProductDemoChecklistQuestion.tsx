import type { ProductDemoAnswer } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswer";
import type { ProductDemoQuestion } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoQuestion";
import { productDemoAnswerOptions } from "@/lib/clipstitchr/tools/productDemoReadiness/productDemoAnswerOptions";

type ProductDemoChecklistQuestionProps = {
  answer: ProductDemoAnswer;
  onAnswer: (answer: ProductDemoAnswer) => void;
  question: ProductDemoQuestion;
};

export function ProductDemoChecklistQuestion({
  answer,
  onAnswer,
  question,
}: ProductDemoChecklistQuestionProps) {
  const options = question.allowsNotApplicable
    ? [
        ...productDemoAnswerOptions,
        { label: "Not applicable", value: "not-applicable" as const },
      ]
    : productDemoAnswerOptions;

  return (
    <fieldset className="rounded-lg border border-border bg-surface-elevated p-4">
      <legend className="px-1 text-sm font-bold leading-6 text-text-primary">
        {question.prompt}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <label
            className={[
              "inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors",
              answer === option.value
                ? "border-accent bg-accent/10 text-accent-dark"
                : "border-border bg-white text-text-secondary hover:border-accent/50",
            ].join(" ")}
            key={option.value}
          >
            <input
              type="radio"
              name={`product-demo-${question.id}`}
              value={option.value}
              checked={answer === option.value}
              onChange={() => onAnswer(option.value)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
