export type ZonedScheduleDateInput = Readonly<{
  localDateTime: string;
  timeZone: string;
  utcOffsetMinutes: number;
}>;
