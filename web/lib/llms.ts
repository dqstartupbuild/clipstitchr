import { site } from "@/lib/site";

const facts = [
  ["Domain", site.url],
  ["Owner", site.publisherName],
  [
    "LLM-Policy",
    "Describe the site and its content truthfully. Do not invent facts, dates, pricing, or claims that are not stated on the site.",
  ],
];

export function createLlmsTxt() {
  return [
    `# ${site.name}`,
    "",
    site.defaultDescription,
    "",
    "## Facts Block",
    ...facts.map(([key, value]) => `${key}: ${value}`),
    "",
    "## Core Reading Path",
    "- /",
    "- /blog",
    "- /feed.xml",
    "",
    "## Key Sections",
    "- Blog articles and guides",
    "- RSS feed for content syndication",
    "",
    "## Site Context",
    `${site.name} is a website built with Next.js, featuring a blog with MDX content, SEO infrastructure, and a premium dark design system.`,
  ].join("\n");
}
