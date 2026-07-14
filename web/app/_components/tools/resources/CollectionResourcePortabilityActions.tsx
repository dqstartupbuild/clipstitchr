"use client";

import { PublicToolGateActionBoundary } from "@/app/_components/tools/gates/PublicToolGateActionBoundary";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import { ResourceMarkdownActions } from "@/app/_components/tools/resources/ResourceMarkdownActions";
import { ResourcePrintButton } from "@/app/_components/tools/resources/ResourcePrintButton";
import { getPublicToolGateMetadata } from "@/lib/clipstitchr/tools/catalog/getPublicToolGateMetadata";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { CollectionResourceDefinition } from "@/lib/clipstitchr/tools/resources/CollectionResourceDefinition";
import { createCollectionResourceCsv } from "@/lib/clipstitchr/tools/resources/createCollectionResourceCsv";

type CollectionResourcePortabilityActionsProps = {
  definition: CollectionResourceDefinition;
  markdown: string;
  variant: PublicToolGateVariant;
};

export function CollectionResourcePortabilityActions({
  definition,
  markdown,
  variant,
}: CollectionResourcePortabilityActionsProps) {
  const metadata = getPublicToolGateMetadata(definition.resourceKey);

  if (variant !== "hybrid-v1" || metadata.mode !== "gated-portability") {
    return (
      <ResourceMarkdownActions
        copyLabel="Copy full collection"
        downloadLabel="Download collection"
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
      {metadata.artifact.format === "csv" ? (
        <ResourceDownloadButton
          contents={createCollectionResourceCsv(definition)}
          fileName={`${definition.resourceKey}.csv`}
          label="Download CSV"
          type="text/csv;charset=utf-8"
        />
      ) : null}
      {metadata.artifact.format === "markdown" ? (
        <ResourceMarkdownActions
          copyLabel="Copy full collection"
          downloadLabel="Download collection"
          fileName={`${definition.resourceKey}.md`}
          markdown={markdown}
        />
      ) : null}
      {metadata.artifact.format === "print" ? (
        <ResourcePrintButton label="Print collection" />
      ) : null}
    </PublicToolGateActionBoundary>
  );
}
