export type PublishingMediaValidationErrorCode =
  | "invalid_descriptor"
  | "invalid_metadata"
  | "invalid_object_key"
  | "missing_immutable_identity"
  | "missing_media"
  | "not_durable"
  | "owner_mismatch"
  | "source_mismatch"
  | "fetch_url_not_ready";

export class PublishingMediaValidationError extends Error {
  readonly code: PublishingMediaValidationErrorCode;

  constructor(code: PublishingMediaValidationErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "PublishingMediaValidationError";
  }
}
