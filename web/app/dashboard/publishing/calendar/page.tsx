import { PublishingCalendar } from "@/app/_components/publishing/calendar/PublishingCalendar";
import { readPublishingCalendarDateSearchParam } from "@/lib/clipstitchr/publishing/client/readPublishingCalendarDateSearchParam";

type PublishingCalendarPageProps = {
  searchParams?: Promise<{ date?: string | string[] }>;
};

export default async function PublishingCalendarPage({
  searchParams = Promise.resolve({}),
}: PublishingCalendarPageProps = {}) {
  const { date } = await searchParams;
  const today = new Date().toISOString().slice(0, 10);
  const initialDate = readPublishingCalendarDateSearchParam(date, today);
  return (
    <PublishingCalendar
      initialDate={initialDate}
      initialDateIsExplicit={typeof date === "string" && date === initialDate}
    />
  );
}
