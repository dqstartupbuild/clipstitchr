import { getRequiredBillingEnvironmentValue } from "./getRequiredBillingEnvironmentValue";

export function getStripePortalConfigurationId() {
  return getRequiredBillingEnvironmentValue("STRIPE_PORTAL_CONFIGURATION_ID");
}
