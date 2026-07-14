"use client";

import { useState } from "react";
import { AppUgcBriefBuilderForm } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefBuilderForm";
import { AppUgcBriefBuilderResults } from "@/app/_components/tools/app-ugc-brief-builder/AppUgcBriefBuilderResults";
import type { AppUgcBriefInput } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/AppUgcBriefInput";
import { createAppUgcBrief } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/createAppUgcBrief";
import { defaultAppUgcBriefInput } from "@/lib/clipstitchr/tools/appUgcBriefBuilder/defaultAppUgcBriefInput";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function AppUgcBriefBuilder({
  variant = "control",
}: PublicToolPageGateProps) {
  const [input, setInput] = useState<AppUgcBriefInput>(
    defaultAppUgcBriefInput,
  );
  const result = createAppUgcBrief(input);

  return (
    <section className="px-6 py-16 md:py-20" aria-label="UGC ad brief builder">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <AppUgcBriefBuilderForm value={input} onChange={setInput} />
        <AppUgcBriefBuilderResults result={result} variant={variant} />
      </div>
    </section>
  );
}
