import { getCustomerDocs } from "@/lib/clipstitchr/docs/getCustomerDocs";
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
  const docsPaths = getCustomerDocs().map((doc) => `- /docs/${doc.slug}`);

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
    "- /case-studies",
    "- /docs",
    ...docsPaths,
    "- /feed.xml",
    "",
    "## Key Sections",
    "- Public landing page for the ClipStitchr authenticated workspace",
    "- Blog articles and guides",
    "- Case studies with real short-form results",
    "- Customer docs for Stitchr, Clipr, Swipr, Swapr, avatars, and rate limits",
    "- RSS feed for content syndication",
    "",
    "## Site Context",
    `${site.name} helps indie app builders and mobile marketers grow on TikTok and Reels without becoming content people. Users upload clips once, pick a product demo, and turn saved footage into finished vertical ads. Stitchr includes a Longr mode for arranging multiple saved clips into one saved Stitch. The public site also keeps docs, a blog, case studies, and RSS feed.`,
  ].join("\n");
}
