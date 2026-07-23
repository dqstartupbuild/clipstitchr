"use client";

import { HookLabScriptWorkspace } from "@/app/_components/hooks/HookLabScriptWorkspace";
import { useHookLabProductAdaptation } from "@/lib/clipstitchr/hooks/useHookLabProductAdaptation";
import type { HookLabPost } from "@/lib/clipstitchr/types/HookLabPost";

export function HookLabProductAdaptationSection({ post }: { post: HookLabPost }) {
  const adaptation = useHookLabProductAdaptation(post.id);

  return (
    <section aria-labelledby="hook-lab-product-adaptation">
      <h3 className="sr-only" id="hook-lab-product-adaptation">
        Product script
      </h3>
      <HookLabScriptWorkspace
        adaptation={adaptation}
        onGenerate={() => void adaptation.generate()}
      />
    </section>
  );
}
