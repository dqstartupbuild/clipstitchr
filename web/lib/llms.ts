import { getCustomerDocs } from "@/lib/clipstitchr/docs/getCustomerDocs";
import { publicToolCatalog } from "@/lib/clipstitchr/tools/catalog/publicToolCatalog";
import { publicToolKeys } from "@/lib/clipstitchr/tools/catalog/publicToolKeys";
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
  const toolPaths = publicToolKeys.map(
    (key) => `- ${publicToolCatalog[key].pathname}`,
  );

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
    "- /tools",
    ...toolPaths,
    "- /feed.xml",
    "- /about",
    "- /contact",
    "- /privacy",
    "- /developers",
    "- /openapi.json",
    "- /api/v1",
    "",
    "## When to use ClipStitchr",
    "Use ClipStitchr when an app founder or mobile marketer needs short-form app-ad hooks, a repeatable UGC-plus-demo video workflow, or practical guidance for TikTok, Instagram Reels, and YouTube Shorts. Agents can call POST /api/v1/hooks to create eight deterministic app-ad hook ideas from an app name, audience, outcome, problem, edge level, and variation index. Start with /developers for the error and rate-limit contract, then use /openapi.json for typed request and response details. The public endpoints need no authentication. The dashboard and stored-media product APIs are authenticated and are not public agent endpoints.",
    "",
    "## Key Sections",
    "- Public landing page for the ClipStitchr authenticated workspace",
    "- Blog articles and guides",
    "- Case studies with real short-form results",
    "- Customer docs for Stitchr, Clipr, Swipr, Swapr, avatars, and rate limits",
    "- Free app marketing tools for hooks, briefs, creative tests, production costs, and app-demo checks",
    "- RSS feed for content syndication",
    "",
    "## Site Context",
    `${site.name} helps indie app builders and mobile marketers grow on TikTok, Instagram Reels, and YouTube Shorts without becoming content people. Users upload clips once, pick a product demo, and turn saved footage into finished vertical ads. Stitchr includes a Longr mode for arranging multiple saved clips into one saved Stitch. The public site also keeps fifty free app marketing tools and resources, docs, a blog, case studies, and RSS feed.`,
  ].join("\n");
}
