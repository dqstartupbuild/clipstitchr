import { AppUgcClipChecklistQuestion } from "@/app/_components/tools/app-ugc-clip-readiness-checker/AppUgcClipChecklistQuestion";
import type { AppUgcClipAnswer } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswer";
import type { AppUgcClipAnswers } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipAnswers";
import type { AppUgcClipQuestionId } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipQuestionId";
import type { AppUgcClipRole } from "@/lib/clipstitchr/tools/appUgcClipReadiness/AppUgcClipRole";
import { appUgcClipQuestions } from "@/lib/clipstitchr/tools/appUgcClipReadiness/appUgcClipQuestions";
import { getAppUgcClipRoleOption } from "@/lib/clipstitchr/tools/appUgcClipReadiness/getAppUgcClipRoleOption";

type AppUgcClipChecklistProps = {
  answers: AppUgcClipAnswers;
  onAnswer: (id: AppUgcClipQuestionId, answer: AppUgcClipAnswer) => void;
  role: AppUgcClipRole;
};

export function AppUgcClipChecklist({
  answers,
  onAnswer,
  role,
}: AppUgcClipChecklistProps) {
  const isSpoken = getAppUgcClipRoleOption(role).isSpoken;

  return (
    <section aria-labelledby="ugc-self-review-heading">
      <h3
        id="ugc-self-review-heading"
        className="text-lg font-bold text-text-primary"
      >
        Your honest clip review
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Watch the clip yourself. The browser does not detect composition,
        motion, voice quality, edit treatment, or usage rights.
      </p>
      <div className="mt-4 grid gap-3">
        {appUgcClipQuestions.map((question) => (
          <AppUgcClipChecklistQuestion
            key={question.id}
            question={question}
            answer={answers[question.id]}
            isApplicable={!question.isSpokenOnly || isSpoken}
            onAnswer={(answer) => onAnswer(question.id, answer)}
          />
        ))}
      </div>
    </section>
  );
}
