"use client";

import { PublicToolGateActionBoundary } from "@/app/_components/tools/gates/PublicToolGateActionBoundary";
import { ResourceDownloadButton } from "@/app/_components/tools/resources/ResourceDownloadButton";
import type { AppHookTestingMatrixResult } from "@/lib/clipstitchr/tools/appHookTestingMatrix/AppHookTestingMatrixResult";
import { createAppHookTestingMatrixCsv } from "@/lib/clipstitchr/tools/appHookTestingMatrix/createAppHookTestingMatrixCsv";
import { formatAppHookTestingMatrixMarkdown } from "@/lib/clipstitchr/tools/appHookTestingMatrix/formatAppHookTestingMatrixMarkdown";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppHookTestingMatrixPortabilityActionProps = {
  result: AppHookTestingMatrixResult;
  variant: PublicToolGateVariant;
};

export function AppHookTestingMatrixPortabilityAction({
  result,
  variant,
}: AppHookTestingMatrixPortabilityActionProps) {
  if (variant === "control") {
    return (
      <ResourceDownloadButton
        contents={formatAppHookTestingMatrixMarkdown(result)}
        fileName="clipstitchr-app-hook-testing-matrix.md"
        label="Download matrix"
        type="text/markdown;charset=utf-8"
      />
    );
  }

  return (
    <PublicToolGateActionBoundary
      hasFunctionalUnlock
      toolKey="app-hook-testing-matrix"
      variant={variant}
    >
      <ResourceDownloadButton
        contents={createAppHookTestingMatrixCsv(result)}
        fileName="clipstitchr-app-hook-testing-matrix.csv"
        label="Download CSV matrix"
        type="text/csv;charset=utf-8"
      />
    </PublicToolGateActionBoundary>
  );
}
