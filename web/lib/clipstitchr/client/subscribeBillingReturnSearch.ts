export function subscribeBillingReturnSearch(onStoreChange: () => void) {
  window.addEventListener("popstate", onStoreChange);

  return () => window.removeEventListener("popstate", onStoreChange);
}
