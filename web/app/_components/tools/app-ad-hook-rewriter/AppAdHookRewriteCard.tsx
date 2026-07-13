import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import type { AppAdHookRewrite } from "@/lib/clipstitchr/tools/appAdHookRewriter/AppAdHookRewrite";

type AppAdHookRewriteCardProps = {
  index: number;
  rewrite: AppAdHookRewrite;
};

export function AppAdHookRewriteCard({
  index,
  rewrite,
}: AppAdHookRewriteCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">
            {index + 1}. {rewrite.label}
          </p>
          <h3 className="mt-3 text-lg font-bold leading-7 text-text-primary">
            {rewrite.text}
          </h3>
        </div>
        <CopyTextButton
          className="shrink-0"
          label={`Copy rewrite ${index + 1}`}
          text={rewrite.text}
        />
      </div>
      <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-text-secondary">
        {rewrite.note}
      </p>
    </article>
  );
}
