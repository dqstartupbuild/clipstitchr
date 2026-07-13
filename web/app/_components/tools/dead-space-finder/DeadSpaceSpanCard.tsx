import type { DeadSpaceSpan } from "@/lib/clipstitchr/tools/deadSpaceFinder/DeadSpaceSpan";
import { formatDuration } from "@/lib/clipstitchr/utils/formatDuration";

type DeadSpaceSpanCardProps = {
  index: number;
  span: DeadSpaceSpan;
};

export function DeadSpaceSpanCard({ index, span }: DeadSpaceSpanCardProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-dark">
        Review span {index + 1}
      </p>
      <h3 className="mt-2 text-xl font-black text-text-primary">
        {formatDuration(span.start)}–{formatDuration(span.end)} ·{" "}
        {span.duration.toFixed(1)}s
      </h3>
      <p className="mt-2 text-sm leading-6 text-text-secondary">
        Low visual change
        {span.averageAudioRms === null
          ? " in a clip without decoded audio"
          : " and low decoded audio"}
        . Watch this span before deciding whether it is intentional breathing
        room or a trim candidate.
      </p>
    </article>
  );
}
