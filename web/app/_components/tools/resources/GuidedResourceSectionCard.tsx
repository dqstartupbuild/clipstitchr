import { GuidedResourceItemRow } from "@/app/_components/tools/resources/GuidedResourceItemRow";
import type { GuidedResourceNotes } from "@/lib/clipstitchr/tools/resources/GuidedResourceNotes";
import type { GuidedResourceSection } from "@/lib/clipstitchr/tools/resources/GuidedResourceSection";

type GuidedResourceSectionCardProps = {
  completedIds: ReadonlySet<string>;
  notes: GuidedResourceNotes;
  onCompletedChange: (itemId: string, completed: boolean) => void;
  onNoteChange: (itemId: string, note: string) => void;
  section: GuidedResourceSection;
};

export function GuidedResourceSectionCard({
  completedIds,
  notes,
  onCompletedChange,
  onNoteChange,
  section,
}: GuidedResourceSectionCardProps) {
  return (
    <section
      className="marketing-card p-5 md:p-6"
      aria-labelledby={`${section.id}-heading`}
    >
      <h3
        id={`${section.id}-heading`}
        className="marketing-subheading text-2xl text-text-primary"
      >
        {section.title}
      </h3>
      <p className="mt-2 leading-7 text-text-secondary">
        {section.description}
      </p>
      <div className="mt-5 grid gap-3">
        {section.items.map((item) => (
          <GuidedResourceItemRow
            completed={completedIds.has(item.id)}
            item={item}
            key={item.id}
            note={notes[item.id] ?? ""}
            onCompletedChange={(completed) =>
              onCompletedChange(item.id, completed)
            }
            onNoteChange={(note) => onNoteChange(item.id, note)}
          />
        ))}
      </div>
    </section>
  );
}
