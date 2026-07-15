import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

type ResourceFaqProps = {
  faqs: readonly ToolFaq[];
};

export function ResourceFaq({ faqs }: ResourceFaqProps) {
  return (
    <section className="public-tool-faq">
      <div>
        <p>Questions</p>
        <h2 className="marketing-heading">What to know before you use it.</h2>
        <div className="public-tool-faq-list">
          {faqs.map((faq) => (
            <details key={faq.question}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
