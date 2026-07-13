import { ProductDemoChecklistQuestion } from "@/app/_components/tools/product-demo-readiness-checker/ProductDemoChecklistQuestion";
import type { ProductDemoAnswers } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswers";
import type { ProductDemoAnswer } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoAnswer";
import type { ProductDemoQuestionId } from "@/lib/clipstitchr/tools/productDemoReadiness/ProductDemoQuestionId";
import { productDemoQuestions } from "@/lib/clipstitchr/tools/productDemoReadiness/productDemoQuestions";

type ProductDemoChecklistProps = {
  answers: ProductDemoAnswers;
  onAnswer: (id: ProductDemoQuestionId, answer: ProductDemoAnswer) => void;
};

export function ProductDemoChecklist({
  answers,
  onAnswer,
}: ProductDemoChecklistProps) {
  return (
    <section aria-labelledby="product-demo-checklist-heading">
      <h3
        id="product-demo-checklist-heading"
        className="text-xl font-bold text-text-primary"
      >
        Review what the file cannot decide for you
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Not sure is a useful answer. It keeps the item in your action list
        instead of pretending the demo is finished.
      </p>
      <div className="mt-5 grid gap-3">
        {productDemoQuestions.map((question) => (
          <ProductDemoChecklistQuestion
            answer={answers[question.id]}
            key={question.id}
            onAnswer={(answer) => onAnswer(question.id, answer)}
            question={question}
          />
        ))}
      </div>
    </section>
  );
}
