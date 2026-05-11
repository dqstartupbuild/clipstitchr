const SAVED_PRODUCT_OPTION_PREFIX = "saved-product:";

export function getSwiprSavedProductIdFromOptionValue(optionValue: string) {
  return optionValue.startsWith(SAVED_PRODUCT_OPTION_PREFIX)
    ? optionValue.slice(SAVED_PRODUCT_OPTION_PREFIX.length)
    : null;
}
