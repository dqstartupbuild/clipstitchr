declare const publishingTenantKeyBrand: unique symbol;

export type PublishingTenantKey = string & {
  readonly [publishingTenantKeyBrand]: "publishing-tenant-key";
};
