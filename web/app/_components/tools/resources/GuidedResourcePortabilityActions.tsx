"use client";

import { PublicToolGateActionBoundary } from "@/app/_components/tools/gates/PublicToolGateActionBoundary";
import { ResourceMarkdownActions } from "@/app/_components/tools/resources/ResourceMarkdownActions";
import { ResourcePrintButton } from "@/app/_components/tools/resources/ResourcePrintButton";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { GuidedResourceDefinition } from "@/lib/clipstitchr/tools/resources/GuidedResourceDefinition";

type GuidedResourcePortabilityActionsProps = {
  definition: GuidedResourceDefinition;
  markdown: string;
  variant: PublicToolGateVariant;
};

export function GuidedResourcePortabilityActions({
  definition,
  markdown,
  variant,
}: GuidedResourcePortabilityActionsProps) {
  const metadata = getPublicToolGateMetadata(definition.resourceKey);

  if (variant !== "hybrid-v1" || metadata.mode !== "gated-portability") {
    return (
      <ResourceMarkdownActions
        copyLabel="Copy my resource"
        downloadLabel="Download Markdown"
        fileName={`${definition.resourceKey}.md`}
        markdown={markdown}
      />
    );
  }

  return (
    <PublicToolGateActionBoundary
      hasFunctionalUnlock
      toolKey={definition.resourceKey}
      variant={variant}
    >
      {metadata.artifact.format === "markdown" ? (
        <ResourceMarkdownActions
          copyLabel="Copy my resource"
          downloadLabel="Download Markdown"
          fileName={`${definition.resourceKey}.md`}
          markdown={markdown}
        />
      ) : null}
      {metadata.artifact.format === "print" ? (
        <ResourcePrintButton label="Print checklist" />
      ) : null}
    </PublicToolGateActionBoundary>
  );
}
