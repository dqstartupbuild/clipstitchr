"use client";

import { useState } from "react";
import { CreativeAssetInventoryForm } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryForm";
import { CreativeAssetInventoryResults } from "@/app/_components/tools/creative-asset-inventory/CreativeAssetInventoryResults";
import type { CreativeAssetInventoryRow } from "@/lib/clipstitchr/tools/creativeAssetInventory/CreativeAssetInventoryRow";
import { defaultCreativeAssetInventoryRows } from "@/lib/clipstitchr/tools/creativeAssetInventory/defaultCreativeAssetInventoryRows";

export function CreativeAssetInventoryWorkspace() {
  const [rows, setRows] = useState<CreativeAssetInventoryRow[]>(
    defaultCreativeAssetInventoryRows,
  );

  return (
    <section className="px-6 py-16" aria-label="Creative asset inventory">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <CreativeAssetInventoryForm rows={rows} onChange={setRows} />
        <CreativeAssetInventoryResults rows={rows} />
      </div>
    </section>
  );
}
