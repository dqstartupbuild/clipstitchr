import { BrandMark } from "@/app/_components/BrandMark";
import { PrimaryButtonLink } from "@/app/_components/PrimaryButtonLink";
import { SecondaryButtonLink } from "@/app/_components/SecondaryButtonLink";
import { site } from "@/lib/site";

export default function NotFound() {
  return (
    <main className="flex min-h-screen bg-background px-6 py-8 text-text-primary">
      <div className="mx-auto flex w-full max-w-5xl flex-col">
        <BrandMark />

        <section className="flex flex-1 items-center py-16">
          <div className="max-w-xl">
            <p className="font-mono text-sm font-semibold uppercase text-accent">
              404
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl">
              Page not found.
            </h1>
            <p className="mt-4 text-base leading-7 text-text-secondary sm:text-lg">
              This page is not in ClipStitchr. Head back to the app or start
              from the homepage.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <PrimaryButtonLink href={site.ctaUrl}>
                Open Dashboard
              </PrimaryButtonLink>
              <SecondaryButtonLink href="/">Back Home</SecondaryButtonLink>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
