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
    "- Public landing page for the ClipStitchr authenticated workspace",
    "- Blog articles and guides",
    "- RSS feed for content syndication",
    "",
    "## Site Context",
    `${site.name} is a browser-first authenticated application for uploading UGC clips and product demo videos, normalizing them to TikTok-ready 9:16, stitching UGC before demo, and downloading the result. The public site also keeps a blog and RSS feed.`,
  ].join("\n");
}
