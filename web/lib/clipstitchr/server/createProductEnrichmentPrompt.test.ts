import { describe, expect, it } from "vitest";
import { cliprHookStyles } from "@/lib/clipstitchr/resources/clipr/cliprHookStyles";
import { cliprHookTemplates } from "@/lib/clipstitchr/resources/clipr/cliprHookTemplates";
import { createProductEnrichmentPrompt } from "@/lib/clipstitchr/server/createProductEnrichmentPrompt";

describe("createProductEnrichmentPrompt", () => {
  it("asks for plain speech and broad Clipr coverage", () => {
    const prompt = createProductEnrichmentPrompt({
      name: "LaunchKit",
      productDetails: "Helps small teams plan product launches.",
      audienceDetails: "Founders and solo marketers.",
      websiteUrl: "https://launchkit.example.com/",
    });
    const lastStyle = cliprHookStyles.at(-1);
    const starterTemplate = cliprHookTemplates.find(
      (template) => template.source === "clipstitchr",
    );
    const appTemplate = cliprHookTemplates.find(
      (template) => template.source === "app_hook_library",
    );

    expect(prompt).toContain("Write in plain speech");
    expect(prompt).toContain("Choose every relevant Clipr hook style");
    expect(prompt).toContain("Make the enrichment audience-first");
    expect(prompt).toContain("product details as a proof bank");
    expect(prompt).toContain("Product website URL: https://launchkit.example.com/");
    expect(prompt).toContain("Cover hundreds of useful hook scenarios");
    expect(prompt).toContain("audience,");
    expect(prompt).toContain("core_belief");
    expect(prompt).toContain("IC-001");
    expect(prompt).toContain("wrong_goal");
    expect(prompt).toContain(lastStyle?.styleKey);
    expect(prompt).toContain(starterTemplate?.id);
    expect(prompt).not.toContain(appTemplate?.id);
  });
});
