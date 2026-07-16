import { getCheckoutIntentIdFromSearchParam } from "@/lib/clipstitchr/billing/getCheckoutIntentIdFromSearchParam";

export function getCanceledCheckoutIntentIdFromSearch(search: string) {
  const searchParams = new URLSearchParams(search);

  if (searchParams.get("billing") !== "canceled") {
    return undefined;
  }

  return getCheckoutIntentIdFromSearchParam(
    searchParams.get("checkout_intent") ?? undefined,
  );
}
