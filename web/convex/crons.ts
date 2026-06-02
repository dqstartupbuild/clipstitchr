import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "plan core daily automation",
  "*/30 * * * *",
  internal.automationScheduler.planCoreDaily,
  {},
);

export default crons;
