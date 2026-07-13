import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import type { AppHookGeneratorHook } from "@/lib/clipstitchr/tools/appHookGenerator/AppHookGeneratorHook";

type AppHookGeneratorResultCardProps = {
  hook: AppHookGeneratorHook;
  index: number;
};

export function AppHookGeneratorResultCard({
  hook,
  index,
}: AppHookGeneratorResultCardProps) {
  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">
            {index + 1}. {hook.angle}
          </p>
          <h3 className="mt-3 text-lg font-bold leading-7 text-text-primary">
            {hook.text}
          </h3>
        </div>
        <CopyTextButton
          className="shrink-0"
          label={`Copy hook ${index + 1}`}
          text={hook.text}
        />
      </div>
      <p className="mt-3 border-t border-border pt-3 text-sm leading-6 text-text-secondary">
        {hook.reason}
      </p>
    </article>
  );
}
