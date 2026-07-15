import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { GuidedResourcePage } from "@/app/_components/tools/resources/GuidedResourcePage";
import { campaignRetrospectiveDefinition } from "@/lib/clipstitchr/tools/campaignRetrospective/campaignRetrospectiveDefinition";
import { isCourseKey } from "@/lib/clipstitchr/tools/courses/isCourseKey";
import { fiveDayContentSprintDefinition } from "@/lib/clipstitchr/tools/fiveDayContentSprint/fiveDayContentSprintDefinition";
import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";
import { testingSystemWorkshopDefinition } from "@/lib/clipstitchr/tools/testingSystemWorkshop/testingSystemWorkshopDefinition";
import { ugcMiniCourseDefinition } from "@/lib/clipstitchr/tools/ugcMiniCourse/ugcMiniCourseDefinition";
import { whyDidThisAdWorkDefinition } from "@/lib/clipstitchr/tools/whyDidThisAdWork/whyDidThisAdWorkDefinition";

const definitions: GuidedResourceDefinition[] = [
  whyDidThisAdWorkDefinition,
  campaignRetrospectiveDefinition,
  fiveDayContentSprintDefinition,
  ugcMiniCourseDefinition,
  testingSystemWorkshopDefinition,
];

describe("guided portfolio resources", () => {
  it.each(definitions)(
    "keeps every item in $resourceKey unique and useful",
    (definition) => {
      const items = definition.sections.flatMap((section) => section.items);

      expect(definition.sections.length).toBeGreaterThanOrEqual(5);
      expect(items.length).toBeGreaterThanOrEqual(10);
      expect(new Set(items.map((item) => item.id))).toHaveLength(items.length);
      expect(definition.faqs.length).toBeGreaterThanOrEqual(2);
    },
  );

  it.each(definitions)(
    "renders $resourceKey with its exact access boundary, lead source, and paid plans",
    (definition) => {
      const markup = renderToStaticMarkup(
        <GuidedResourcePage definition={definition} />,
      );

      expect(markup).toContain(definition.completionLabel);
      expect(markup).toContain(`id="${definition.resourceKey}-lead-heading"`);
      expect(markup).toContain('href="/pricing"');
      if (isCourseKey(definition.resourceKey)) {
        expect(markup).toContain(definition.sections[0]!.title);
        expect(markup).not.toContain(definition.sections[0]!.items[0]!.body);
        expect(markup).not.toContain("Download Markdown");
      } else {
        expect(markup).toContain("Download Markdown");
      }
    },
  );

  it("does not store course work in browser-local progress keys", () => {
    expect(fiveDayContentSprintDefinition.progressStorageKey).toBeUndefined();
    expect(ugcMiniCourseDefinition.progressStorageKey).toBeUndefined();
    expect(testingSystemWorkshopDefinition.progressStorageKey).toBeUndefined();
    expect(whyDidThisAdWorkDefinition.progressStorageKey).toBeUndefined();
    expect(campaignRetrospectiveDefinition.progressStorageKey).toBeUndefined();
  });
});
