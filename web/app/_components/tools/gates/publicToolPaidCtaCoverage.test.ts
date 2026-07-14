import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const toolsRoot = join(process.cwd(), "app", "_components", "tools");
const pendingDirectories = [toolsRoot];
const toolComponentPaths: string[] = [];

while (pendingDirectories.length > 0) {
  const directory = pendingDirectories.pop();

  if (!directory) continue;

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const entryPath = join(directory, entry.name);

    if (entry.isDirectory()) pendingDirectories.push(entryPath);
    if (
      entry.isFile() &&
      entry.name.endsWith(".tsx") &&
      !entry.name.endsWith(".test.tsx")
    ) {
      toolComponentPaths.push(relative(toolsRoot, entryPath));
    }
  }
}

const toolComponentSources = toolComponentPaths
  .map((componentPath) => ({
    componentPath,
    source: readFileSync(join(toolsRoot, componentPath), "utf8"),
  }));

describe("public tool paid CTA coverage", () => {
  it("routes every tool-specific pricing link through the fixed-event wrapper", () => {
    const directPricingLinkFiles = toolComponentSources
      .filter(({ source }) => source.includes('href="/pricing"'))
      .map(({ componentPath }) => componentPath)
      .sort();

    expect(directPricingLinkFiles).toEqual([
      "ToolsIndexPage.tsx",
      "gates/PublicToolPaidCtaLink.tsx",
    ]);
  });

  it("requires fixed tool and experiment context at every paid CTA seam", () => {
    const paidCtaTags = toolComponentSources.flatMap(
      ({ componentPath, source }) =>
        Array.from(
          source.matchAll(/<PublicToolPaidCtaLink[\s\S]*?>/g),
          (match) => ({ componentPath, tag: match[0] }),
        ),
    );
    const resourceCtaTags = toolComponentSources.flatMap(
      ({ componentPath, source }) =>
        Array.from(
          source.matchAll(/<ResourcePricingCta[\s\S]*?\/>/g),
          (match) => ({ componentPath, tag: match[0] }),
        ),
    );

    expect(paidCtaTags.length).toBeGreaterThan(0);
    expect(resourceCtaTags.length).toBeGreaterThan(0);

    for (const { componentPath, tag } of [
      ...paidCtaTags,
      ...resourceCtaTags,
    ]) {
      expect(tag, relative(process.cwd(), join(toolsRoot, componentPath))).toMatch(
        /\btoolKey=/,
      );
      expect(tag, relative(process.cwd(), join(toolsRoot, componentPath))).toMatch(
        /\bvariant=/,
      );
    }
  });

  it("composes general click analytics with the fixed paid event", () => {
    const wrapperSource = readFileSync(
      join(toolsRoot, "gates", "PublicToolPaidCtaLink.tsx"),
      "utf8",
    );

    expect(wrapperSource).toContain("<TrackedButtonLink");
    expect(wrapperSource).toContain(
      'trackPublicToolAnalyticsEvent("tool_paid_cta_clicked"',
    );
  });
});
