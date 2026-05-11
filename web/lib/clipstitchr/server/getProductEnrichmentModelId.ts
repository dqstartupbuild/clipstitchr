const DEFAULT_PRODUCT_ENRICHMENT_MODEL_ID = "openai/gpt-4.1";

export function getProductEnrichmentModelId() {
  return (
    process.env.PRODUCT_ENRICHMENT_MODEL_ID ??
    DEFAULT_PRODUCT_ENRICHMENT_MODEL_ID
  );
}
