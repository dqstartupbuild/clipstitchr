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

crons.interval(
  "reconcile paid usage and generation claims",
  { minutes: 5 },
  internal.usage.reconcileUsageState.reconcileUsageState,
  {},
);

crons.interval(
  "plan due social deliveries",
  { minutes: 1 },
  internal.socialPublishing.planDueSocialTargets.planDueSocialTargets,
  {},
);

crons.interval(
  "reconcile social delivery status",
  { minutes: 1 },
  internal.socialPublishing.planSocialStatusChecks.planSocialStatusChecks,
  {},
);

crons.interval(
  "expire social connection state",
  { minutes: 10 },
  internal.socialOAuth.expireSocialOAuthStates.expireSocialOAuthStates,
  {},
);

export default crons;
