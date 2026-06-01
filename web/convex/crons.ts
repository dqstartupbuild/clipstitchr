import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "plan core daily automation",
  "*/30 * * * *",
  internal.automationScheduler.planCoreDaily,
  {},
);

crons.cron(
  "dispatch core provider automation",
  "*/10 * * * *",
  internal.automationScheduler.dispatchCoreProviders,
  {},
);

export default crons;
