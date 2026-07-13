import { CopyTextButton } from "@/app/_components/ui/CopyTextButton";
import type { CollectionResourceItem } from "@/lib/clipstitchr/tools/resources/CollectionResourceItem";

type CollectionResourceCardProps = {
  item: CollectionResourceItem;
};

export function CollectionResourceCard({ item }: CollectionResourceCardProps) {
  return (
    <article className="marketing-card flex h-full flex-col p-5">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-dark">
        {item.eyebrow}
      </p>
      <h3 className="marketing-subheading mt-3 text-2xl text-text-primary">
        {item.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-text-secondary">
        {item.body}
      </p>
      <div className="mt-4 rounded-lg border border-border bg-surface-muted/40 p-3 text-sm font-semibold leading-6 text-text-primary">
        {item.copyText}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {item.tags.map((tag) => (
          <span
            className="rounded-full bg-accent/8 px-2.5 py-1 text-xs font-bold text-accent-dark"
            key={tag}
          >
            {tag}
          </span>
        ))}
      </div>
      <CopyTextButton
        className="mt-5 self-start"
        label="Copy this"
        text={item.copyText}
      />
    </article>
  );
}
