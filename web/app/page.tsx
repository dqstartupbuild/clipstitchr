"use client";

import { useEffect, useRef } from "react";
import { SiteHeader } from "@/app/site-header";
import { SiteFooter } from "@/app/site-footer";
import { site } from "@/lib/site";

/* ─── Feature cards ─── */
const FEATURES = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    description:
      "Server-side rendering and static generation with Next.js 16 and React 19 out of the box.",
  },
  {
    icon: "🎨",
    title: "Premium Design System",
    description:
      "A curated dark theme with smooth animations, hover effects, and a complete set of design tokens.",
  },
  {
    icon: "📝",
    title: "Blog Ready",
    description:
      "Content collections with MDX, Zod schema validation, reading time, categories, and related posts.",
  },
  {
    icon: "🔍",
    title: "SEO From Day One",
    description:
      "Sitemap, robots.txt, JSON-LD, Open Graph, Twitter cards, and canonical URLs — all pre-configured.",
  },
  {
    icon: "📡",
    title: "RSS & LLMs.txt",
    description:
      "Auto-generated RSS feed and LLMs.txt so humans and AI can both discover your content.",
  },
  {
    icon: "🧪",
    title: "Test Coverage",
    description:
      "Vitest with V8 coverage, schema tests, SEO integration tests, and metadata tests included.",
  },
];

/* ─── Component ─── */
export default function Home() {
  const revealRefs = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const addRevealRef = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-background font-sans">
      {/* ─── Navigation ─── */}
      <SiteHeader variant="landing" />

      {/* ─── Hero Section ─── */}
      <section
        id="hero"
        className="relative grid-bg flex flex-col items-center justify-center text-center px-6 pt-36 pb-24 md:pt-44 md:pb-32"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, var(--accent-glow) 0%, transparent 60%), var(--background)",
        }}
      >
        <h1 className="animate-fade-up delay-100 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-[1.05] tracking-tight text-text-primary">
          {site.name}
        </h1>

        <p className="animate-fade-up delay-200 mt-6 text-lg md:text-xl max-w-2xl leading-relaxed text-text-secondary">
          {site.defaultDescription}
        </p>

        <div className="animate-fade-up delay-300 flex flex-col sm:flex-row items-center gap-4 mt-10">
          <a
            id="hero-cta"
            href={site.ctaUrl}
            className="btn-primary text-lg animate-pulse-glow"
          >
            {site.ctaLabel}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M7 17L17 7" />
              <path d="M7 7h10v10" />
            </svg>
          </a>
          <a href="#features" className="btn-secondary">
            See what&rsquo;s included ↓
          </a>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── Features Section ─── */}
      <section
        id="features"
        className="relative grid-bg px-6 py-24 md:py-32"
        style={{ background: "var(--surface)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div ref={addRevealRef} className="reveal text-center mb-16">
            <p
              className="uppercase text-xs tracking-[0.2em] font-semibold mb-4"
              style={{ color: "var(--accent)" }}
            >
              What&rsquo;s included
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold max-w-3xl mx-auto text-text-primary">
              Everything you need
              <br className="hidden sm:block" /> to ship fast.
            </h2>
            <p className="mt-5 text-lg text-text-secondary max-w-2xl mx-auto">
              A production-ready foundation with content, SEO, testing, and a
              design system that looks premium from the start.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <div
                ref={addRevealRef}
                key={feature.title}
                className="reveal card group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <span className="text-3xl block mb-3 group-hover:animate-float">
                  {feature.icon}
                </span>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="section-divider" />

      {/* ─── CTA Section ─── */}
      <section
        id="cta"
        className="relative grid-bg px-6 py-28 md:py-36 text-center"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, var(--accent-glow-strong) 0%, transparent 60%), var(--background)",
        }}
      >
        <div className="max-w-3xl mx-auto">
          <div ref={addRevealRef} className="reveal">
            <p
              className="uppercase text-xs tracking-[0.2em] font-semibold mb-4"
              style={{ color: "var(--accent)" }}
            >
              Ready?
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary mb-6">
              Start building
              <br className="hidden sm:block" /> something great.
            </h2>
            <p className="text-lg text-text-secondary max-w-xl mx-auto mb-10">
              This is your starting point. Replace this content, add your own
              blog posts, and make it yours.
            </p>

            <a
              id="cta-button"
              href={site.ctaUrl}
              className="btn-primary text-lg animate-pulse-glow"
            >
              {site.ctaLabel}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <SiteFooter />
    </div>
  );
}
