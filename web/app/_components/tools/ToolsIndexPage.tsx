import Link from "next/link";
import { ToolsIndexLibrary } from "@/app/_components/tools/ToolsIndexLibrary";

export function ToolsIndexPage() {
  return (
    <div className="marketing-grid-bg px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <header className="max-w-3xl">
          <p className="marketing-eyebrow">Free app marketing tools</p>
          <h1 className="marketing-heading mt-6 text-5xl text-text-primary md:text-7xl">
            Make the plan before you make the ad.
          </h1>
          <p className="mt-6 text-lg leading-8 text-text-secondary">
            Fifty focused tools and resources for indie app founders and app
            marketers who need clearer hooks, briefs, demo checks, test plans,
            production numbers, and repeatable content systems.
          </p>
        </header>

        <ToolsIndexLibrary />

        <section className="marketing-card mt-12 flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-accent-dark">
              Need the full workflow?
            </p>
            <h2 className="marketing-subheading mt-2 text-3xl text-text-primary">
              Turn the plan into finished ads.
            </h2>
            <p className="mt-3 leading-7 text-text-secondary">
              ClipStitchr is paid software for turning raw clips and product
              demos into short-form ads you can actually publish.
            </p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg bg-accent px-5 text-sm font-bold text-white transition-colors hover:bg-accent-dark"
          >
            See paid plans
          </Link>
        </section>
      </div>
    </div>
  );
}
