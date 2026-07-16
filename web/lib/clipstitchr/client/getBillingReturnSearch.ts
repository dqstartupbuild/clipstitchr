export function getBillingReturnSearch() {
  return typeof window === "undefined"
    ? null
    : new URLSearchParams(window.location?.search ?? "").get("billing");
}
