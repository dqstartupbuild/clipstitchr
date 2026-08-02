export class InvalidPublishingScheduleError extends Error {
  constructor() {
    super("Choose a valid future date, time, and time zone.");
    this.name = "InvalidPublishingScheduleError";
  }
}
