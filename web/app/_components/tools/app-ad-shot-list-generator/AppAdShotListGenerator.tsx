"use client";

import { useState } from "react";
import { AppAdShotListEmptyState } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListEmptyState";
import { AppAdShotListForm } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListForm";
import { AppAdShotListResults } from "@/app/_components/tools/app-ad-shot-list-generator/AppAdShotListResults";
import type { AppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/AppAdShotListInput";
import { createAppAdShotList } from "@/lib/clipstitchr/tools/appAdShotList/createAppAdShotList";
import { defaultAppAdShotListInput } from "@/lib/clipstitchr/tools/appAdShotList/defaultAppAdShotListInput";
import { getAppAdShotListMissingFields } from "@/lib/clipstitchr/tools/appAdShotList/getAppAdShotListMissingFields";
import type { PublicToolGateVariant } from "@/lib/clipstitchr/tools/catalog/PublicToolGateVariant";

type AppAdShotListGeneratorProps = {
  variant?: PublicToolGateVariant;
};

export function AppAdShotListGenerator({
  variant = "control",
}: AppAdShotListGeneratorProps) {
  const [input, setInput] = useState<AppAdShotListInput>(
    defaultAppAdShotListInput,
  );
  const missingFields = getAppAdShotListMissingFields(input);

  return (
    <section
      className="px-6 py-16 md:py-20"
      aria-label="App ad shot list generator"
    >
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <AppAdShotListForm value={input} onChange={setInput} />
        {missingFields.length > 0 ? (
          <AppAdShotListEmptyState missingFields={missingFields} />
        ) : (
          <AppAdShotListResults
            result={createAppAdShotList(input)}
            variant={variant}
          />
        )}
      </div>
    </section>
  );
}
