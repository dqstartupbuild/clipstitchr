"use client";

import { useState } from "react";
import { ClientContentCapacityForm } from "@/app/_components/tools/client-content-capacity-calculator/ClientContentCapacityForm";
import { ClientContentCapacityResults } from "@/app/_components/tools/client-content-capacity-calculator/ClientContentCapacityResults";
import { calculateClientContentCapacity } from "@/lib/clipstitchr/tools/clientContentCapacity/calculateClientContentCapacity";
import type { ClientContentCapacityInput } from "@/lib/clipstitchr/tools/clientContentCapacity/ClientContentCapacityInput";
import { defaultClientContentCapacityInput } from "@/lib/clipstitchr/tools/clientContentCapacity/defaultClientContentCapacityInput";

export function ClientContentCapacityCalculator() {
  const [input, setInput] = useState<ClientContentCapacityInput>(
    defaultClientContentCapacityInput,
  );

  return (
    <section
      className="px-6 py-16"
      aria-label="Client content capacity calculator"
    >
      <div className="mx-auto grid max-w-7xl gap-6 xl:grid-cols-[1.1fr_0.9fr] xl:items-start">
        <ClientContentCapacityForm value={input} onChange={setInput} />
        <ClientContentCapacityResults
          result={calculateClientContentCapacity(input)}
        />
      </div>
    </section>
  );
}
