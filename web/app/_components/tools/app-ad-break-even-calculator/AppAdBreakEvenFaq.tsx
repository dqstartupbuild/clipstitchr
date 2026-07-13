import { appAdBreakEvenFaqs } from "@/lib/clipstitchr/tools/appAdBreakEven/appAdBreakEvenFaqs";

export function AppAdBreakEvenFaq() {
  return (
    <section className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">Common questions</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
          App ad break-even calculator FAQ
        </h2>
        <div className="mt-10 grid gap-4">
          {appAdBreakEvenFaqs.map((faq) => (
            <article className="marketing-card p-6" key={faq.question}>
              <h3 className="text-lg font-bold text-text-primary">
                {faq.question}
              </h3>
              <p className="mt-3 leading-7 text-text-secondary">{faq.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
