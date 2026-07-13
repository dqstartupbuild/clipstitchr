"use client";

import { useState } from "react";
import { ClipNamingSystemForm } from "@/app/_components/tools/clip-naming-system-generator/ClipNamingSystemForm";
import { ClipNamingSystemResults } from "@/app/_components/tools/clip-naming-system-generator/ClipNamingSystemResults";
import type { ClipNamingSystemInput } from "@/lib/clipstitchr/tools/clipNamingSystem/ClipNamingSystemInput";
import { defaultClipNamingSystemInput } from "@/lib/clipstitchr/tools/clipNamingSystem/defaultClipNamingSystemInput";
import { generateClipNamingSystem } from "@/lib/clipstitchr/tools/clipNamingSystem/generateClipNamingSystem";

export function ClipNamingSystemWorkspace() {
  const [input, setInput] = useState<ClipNamingSystemInput>(
    defaultClipNamingSystemInput,
  );

  return (
    <section className="px-6 py-16" aria-label="Clip naming system generator">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <ClipNamingSystemForm value={input} onChange={setInput} />
        <ClipNamingSystemResults result={generateClipNamingSystem(input)} />
      </div>
    </section>
  );
}
