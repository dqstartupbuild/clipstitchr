import { ShortFormAuditQuestionRow } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditQuestionRow";
import { Panel } from "@/app/_components/ui/Panel";
import { PanelHeader } from "@/app/_components/ui/PanelHeader";
import type { ShortFormAuditResponses } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResponses";
import { shortFormAuditDimensionLabels } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditDimensionLabels";
import { shortFormAuditDimensionOrder } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditDimensionOrder";
import { shortFormAuditQuestions } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/shortFormAuditQuestions";

type ShortFormAuditFormProps = {
  onChange: (responses: ShortFormAuditResponses) => void;
  responses: ShortFormAuditResponses;
};

export function ShortFormAuditForm({
  onChange,
  responses,
}: ShortFormAuditFormProps) {
  return (
    <Panel className="p-5 md:p-6">
      <PanelHeader
        eyebrow="Ten visible questions"
        title="Score the system you have today"
        description="Each answer is worth 0, 5, or 10 points. Two questions make each 20-point dimension."
      />
      <div className="mt-6 grid gap-7">
        {shortFormAuditDimensionOrder.map((dimension) => (
          <fieldset className="grid gap-3" key={dimension}>
            <legend className="text-lg font-bold text-text-primary">
              {shortFormAuditDimensionLabels[dimension]} · 20 points
            </legend>
            {shortFormAuditQuestions
              .filter((question) => question.dimension === dimension)
              .map((question) => (
                <ShortFormAuditQuestionRow
                  key={question.id}
                  question={question}
                  score={responses[question.id] ?? 0}
                  onChange={(score) =>
                    onChange({ ...responses, [question.id]: score })
                  }
                />
              ))}
          </fieldset>
        ))}
      </div>
    </Panel>
  );
}
