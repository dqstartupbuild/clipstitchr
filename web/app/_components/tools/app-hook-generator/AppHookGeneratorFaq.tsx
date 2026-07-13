import { appHookGeneratorFaqs } from "@/lib/clipstitchr/tools/appHookGenerator/appHookGeneratorFaqs";

export function AppHookGeneratorFaq() {
  return (
    <section className="px-6 py-20 md:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="marketing-eyebrow">Common questions</p>
        <h2 className="marketing-heading mt-5 text-4xl text-text-primary md:text-6xl">
          App Hook Generator FAQ
        </h2>
        <div className="mt-10 grid gap-4">
          {appHookGeneratorFaqs.map((item) => (
            <article className="marketing-card p-6" key={item.question}>
              <h3 className="text-lg font-bold text-text-primary">
                {item.question}
              </h3>
              <p className="mt-3 leading-7 text-text-secondary">
                {item.answer}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
