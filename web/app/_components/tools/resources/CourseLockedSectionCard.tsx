import { LockKeyhole } from "lucide-react";
import type { CourseLockedSection } from "@/lib/clipstitchr/tools/courses/CourseLockedSection";

type CourseLockedSectionCardProps = {
  section: CourseLockedSection;
};

export function CourseLockedSectionCard({
  section,
}: CourseLockedSectionCardProps) {
  return (
    <article className="marketing-card border-dashed p-5 opacity-80 md:p-6">
      <div className="flex items-start gap-3">
        <LockKeyhole
          aria-hidden
          className="mt-1 h-5 w-5 shrink-0 text-text-tertiary"
        />
        <div>
          <h3 className="text-xl font-black text-text-primary">
            {section.title}
          </h3>
          <p className="mt-2 text-sm leading-6 text-text-secondary">
            {section.releaseAt
              ? "Opens "
              : "Confirm your email to begin this course."}
            {section.releaseAt ? (
              <time
                dateTime={new Date(section.releaseAt).toISOString()}
                suppressHydrationWarning
              >
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(section.releaseAt))}
                {"."}
              </time>
            ) : null}
          </p>
        </div>
      </div>
    </article>
  );
}
