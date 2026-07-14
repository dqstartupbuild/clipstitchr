import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.cron(
  "plan core daily automation",
  "*/30 * * * *",
  internal.automationScheduler.planCoreDaily,
  {},
);

crons.interval(
  "recover email provider operations",
  { minutes: 1 },
  internal.email.recoverEmailProviderOperations.recoverEmailProviderOperations,
  {},
);

export default crons;
