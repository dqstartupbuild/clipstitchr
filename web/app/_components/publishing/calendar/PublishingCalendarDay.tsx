import { PublishingCalendarPost } from "@/app/_components/publishing/calendar/PublishingCalendarPost";
import type { PublishingPostSummary } from "@/lib/clipstitchr/publishing/client/contracts/PublishingPostSummary";

type PublishingCalendarDayProps = {
  date: string;
  posts: PublishingPostSummary[];
  timeZone: string;
};

export function PublishingCalendarDay({
  date,
  posts,
  timeZone,
}: PublishingCalendarDayProps) {
  const value = new Date(`${date}T12:00:00.000Z`);
  const dayName = new Intl.DateTimeFormat(undefined, {
    timeZone: "UTC",
    weekday: "short",
  }).format(value);
  const dayNumber = new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(value);

  return (
    <section className="publishing-calendar-day" aria-label={`${dayName}, ${dayNumber}`}>
      <header>
        <strong>{dayName}</strong>
        <span>{dayNumber}</span>
      </header>
      <div className="publishing-calendar-day-posts">
        {posts.length ? (
          posts.map((post) => (
            <PublishingCalendarPost key={post.id} post={post} timeZone={timeZone} />
          ))
        ) : (
          <p>No posts</p>
        )}
      </div>
    </section>
  );
}
