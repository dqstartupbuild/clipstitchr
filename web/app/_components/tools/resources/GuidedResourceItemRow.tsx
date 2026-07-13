import type { GuidedResourceItem } from "@/lib/clipstitchr/tools/resources/GuidedResourceItem";

type GuidedResourceItemRowProps = {
  completed: boolean;
  item: GuidedResourceItem;
  note: string;
  onCompletedChange: (completed: boolean) => void;
  onNoteChange: (note: string) => void;
};

export function GuidedResourceItemRow({
  completed,
  item,
  note,
  onCompletedChange,
  onNoteChange,
}: GuidedResourceItemRowProps) {
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          checked={completed}
          className="mt-1 h-4 w-4 accent-accent"
          onChange={(event) => onCompletedChange(event.currentTarget.checked)}
          type="checkbox"
        />
        <span>
          <span className="font-bold text-text-primary">
            {item.title}
            {item.critical ? " · Must check" : ""}
          </span>
          <span className="mt-1 block text-sm leading-6 text-text-secondary">
            {item.body}
          </span>
        </span>
      </label>
      {item.noteLabel ? (
        <label className="mt-4 grid gap-2 text-sm font-semibold text-text-primary">
          {item.noteLabel}
          <textarea
            className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-medium leading-6 text-text-primary outline-none focus:border-accent"
            maxLength={600}
            onChange={(event) => onNoteChange(event.currentTarget.value)}
            placeholder={item.notePlaceholder}
            rows={3}
            value={note}
          />
        </label>
      ) : null}
    </article>
  );
}
