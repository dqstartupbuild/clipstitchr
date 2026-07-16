import { getRequiredBillingEnvironmentValue } from "./getRequiredBillingEnvironmentValue";
import { getStripeMode } from "./getStripeMode";

export function getBillingAppUrl() {
  const value = getRequiredBillingEnvironmentValue("CLIPSTITCHR_APP_URL");
  const url = new URL(value);

  if (
    url.protocol !== "https:" &&
    !(getStripeMode() === "test" && url.hostname === "localhost")
  ) {
    throw new Error("CLIPSTITCHR_APP_URL must use HTTPS outside local tests.");
  }

  return url.origin;
}
