"use client";

import { useState } from "react";
import { AppAdCreativeTestingBlueprintForm } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintForm";
import { AppAdCreativeTestingBlueprintResults } from "@/app/_components/tools/app-ad-creative-testing-blueprint-builder/AppAdCreativeTestingBlueprintResults";
import type { AppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/AppAdCreativeTestingBlueprintInput";
import { buildAppAdCreativeTestingBlueprint } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/buildAppAdCreativeTestingBlueprint";
import { defaultAppAdCreativeTestingBlueprintInput } from "@/lib/clipstitchr/tools/appAdCreativeTestingBlueprint/defaultAppAdCreativeTestingBlueprintInput";
import type { PublicToolPageGateProps } from "@/lib/clipstitchr/tools/catalog/PublicToolPageGateProps";

export function AppAdCreativeTestingBlueprintBuilder({
  variant = "control",
}: PublicToolPageGateProps) {
  const [input, setInput] = useState<AppAdCreativeTestingBlueprintInput>(
    defaultAppAdCreativeTestingBlueprintInput,
  );
  const build = buildAppAdCreativeTestingBlueprint(input);

  return (
    <section
      aria-label="App ad creative testing blueprint builder"
      className="px-6 py-16 md:py-20"
    >
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[0.78fr_1.22fr] xl:items-start">
        <AppAdCreativeTestingBlueprintForm value={input} onChange={setInput} />
        <AppAdCreativeTestingBlueprintResults build={build} variant={variant} />
      </div>
    </section>
  );
}
