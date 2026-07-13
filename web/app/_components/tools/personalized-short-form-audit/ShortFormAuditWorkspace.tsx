"use client";

import { useState } from "react";
import { ShortFormAuditForm } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditForm";
import { ShortFormAuditResults } from "@/app/_components/tools/personalized-short-form-audit/ShortFormAuditResults";
import { calculatePersonalizedShortFormAudit } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/calculatePersonalizedShortFormAudit";
import { defaultShortFormAuditResponses } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/defaultShortFormAuditResponses";
import type { ShortFormAuditResponses } from "@/lib/clipstitchr/tools/personalizedShortFormAudit/ShortFormAuditResponses";

export function ShortFormAuditWorkspace() {
  const [responses, setResponses] = useState<ShortFormAuditResponses>(
    defaultShortFormAuditResponses,
  );

  return (
    <section className="px-6 py-16" aria-label="Short-form content audit">
      <div className="mx-auto grid max-w-7xl gap-6">
        <ShortFormAuditForm responses={responses} onChange={setResponses} />
        <ShortFormAuditResults
          result={calculatePersonalizedShortFormAudit(responses)}
        />
      </div>
    </section>
  );
}
