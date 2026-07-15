import Link from "next/link";
import { ToolsIndexLibrary } from "@/app/_components/tools/ToolsIndexLibrary";

export function ToolsIndexPage() {
  return (
    <div className="tools-index-page">
      <div className="tools-index-inner">
        <header className="tools-index-hero">
          <p>50 free working tools</p>
          <h1 className="marketing-heading">Plan. Make. Publish.</h1>
          <p>
            Fifty focused tools and resources for indie app founders and app
            marketers who need clearer hooks, briefs, demo checks, test plans,
            production numbers, and repeatable content systems.
          </p>
        </header>

        <ToolsIndexLibrary />

        <section className="tools-index-paid-note">
          <div>
            <p>Planning stops here. Production starts in ClipStitchr.</p>
            <h2>Turn the plan into finished ads.</h2>
            <p>
              ClipStitchr is paid software for turning raw clips and product
              demos into short-form ads you can actually publish.
            </p>
          </div>
          <Link
            href="/pricing"
            className="public-primary-action inline-flex h-11 shrink-0 items-center justify-center bg-accent px-5 text-sm font-bold text-text-inverse transition-colors hover:bg-accent-light"
          >
            See paid plans
          </Link>
        </section>
      </div>
    </div>
  );
}
