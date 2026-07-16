import { EmailProviderConfigurationError } from "../operations/EmailProviderConfigurationError";
import type { AccountEmailDataVariables } from "./AccountEmailDataVariables";
import type { AccountEmailTemplateKey } from "./AccountEmailTemplateKey";

function requireVariable(
  variables: AccountEmailDataVariables,
  key: string,
) {
  const value = variables[key];

  if ((typeof value !== "string" && typeof value !== "number") || value === "") {
    throw new EmailProviderConfigurationError();
  }

  return value;
}

export function createLoopsAccountEmailDataVariables(args: {
  dashboardUrl: string;
  eventVariables: AccountEmailDataVariables;
  firstName: string;
  settingsUrl: string;
  supportEmail: string;
  templateKey: AccountEmailTemplateKey;
}): AccountEmailDataVariables {
  const shared = {
    firstName: args.firstName,
    supportEmail: args.supportEmail,
  };

  if (args.templateKey === "account-created") {
    return { ...shared, dashboardUrl: args.dashboardUrl };
  }

  if (args.templateKey === "subscription-status") {
    return {
      ...shared,
      effectiveDate: requireVariable(args.eventVariables, "effectiveDate"),
      headline: requireVariable(args.eventVariables, "headline"),
      planName: requireVariable(args.eventVariables, "planName"),
      settingsUrl: args.settingsUrl,
      summary: requireVariable(args.eventVariables, "summary"),
    };
  }

  if (args.templateKey === "credits-updated") {
    return {
      ...shared,
      creditsAdded: requireVariable(args.eventVariables, "creditsAdded"),
      expiresOn: requireVariable(args.eventVariables, "expiresOn"),
      headline: requireVariable(args.eventVariables, "headline"),
      settingsUrl: args.settingsUrl,
      summary: requireVariable(args.eventVariables, "summary"),
    };
  }

  return {
    ...shared,
    graceEndsOn: requireVariable(args.eventVariables, "graceEndsOn"),
    headline: requireVariable(args.eventVariables, "headline"),
    settingsUrl: args.settingsUrl,
    summary: requireVariable(args.eventVariables, "summary"),
  };
}
