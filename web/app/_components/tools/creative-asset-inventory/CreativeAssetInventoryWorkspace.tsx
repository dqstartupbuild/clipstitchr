"use client";

import { useState } from "react";
import { CreativeAssetInventoryForm } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryForm";
import { CreativeAssetInventoryResults } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryResults";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";
import { defaultCreativeAssetInventoryRows } from "@/lib/clipstitchr/tools/creativeAssetInventory/defaultCreativeAssetInventoryRows";

type CreativeAssetInventoryWorkspaceProps = {
  hasFunctionalUnlock?: boolean;
  variant?: PublicToolGateVariant;
};

export function CreativeAssetInventoryWorkspace({
  hasFunctionalUnlock = false,
  variant = "control",
}: CreativeAssetInventoryWorkspaceProps) {
  const [rows, setRows] = useState<CreativeAssetInventoryRow[]>(
    defaultCreativeAssetInventoryRows,
  );

  return (
    <section className="px-6 py-16" aria-label="Creative asset inventory">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <CreativeAssetInventoryForm rows={rows} onChange={setRows} />
        <CreativeAssetInventoryResults
          hasFunctionalUnlock={hasFunctionalUnlock}
          rows={rows}
          variant={variant}
        />
      </div>
    </section>
  );
}
