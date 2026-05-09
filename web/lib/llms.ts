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
    `${site.name} helps marketers turn UGC clips and product demos into finished vertical ad variants without opening a traditional video editor. The public site also keeps a blog and RSS feed.`,
  ].join("\n");
}
