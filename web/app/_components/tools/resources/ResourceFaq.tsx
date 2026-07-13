import type { ToolFaq } from "@/lib/clipstitchr/types/ToolFaq";

type ResourceFaqProps = {
  faqs: readonly ToolFaq[];
};

export function ResourceFaq({ faqs }: ResourceFaqProps) {
  return (
    <section className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">Questions</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-5xl">
          What to know before you use it.
        </h2>
        <div className="mt-8 grid gap-4">
          {faqs.map((faq) => (
            <details className="marketing-card p-6" key={faq.question}>
              <summary className="cursor-pointer font-bold text-text-primary">
                {faq.question}
              </summary>
              <p className="mt-4 leading-7 text-text-secondary">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
