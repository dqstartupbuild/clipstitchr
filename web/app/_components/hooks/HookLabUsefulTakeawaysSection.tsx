export function HookLabUsefulTakeawaysSection({
  lessons,
}: {
  lessons: string[];
}) {
  if (!lessons.length) {
    return null;
  }

  return (
    <section aria-labelledby="hook-lab-report-lessons">
      <h4
        className="text-balance text-base font-bold text-text-primary"
        id="hook-lab-report-lessons"
      >
        Useful takeaways
      </h4>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-text-secondary">
        {lessons.map((lesson) => (
          <li className="text-pretty" key={lesson}>
            {lesson}
          </li>
        ))}
      </ul>
    </section>
  );
}
