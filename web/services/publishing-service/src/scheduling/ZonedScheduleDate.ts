export type ZonedScheduleDate = Readonly<{
  instant: Date;
  localDateTime: string;
  timeZone: string;
  utcOffsetMinutes: number;
}>;
