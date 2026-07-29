type R2BucketEnvironment = Record<string, string | undefined> & {
  R2_BUCKET?: string;
  R2_BUCKET_NAME?: string;
};

export function resolveR2BucketName(environment: R2BucketEnvironment) {
  const bucketName =
    environment.R2_BUCKET?.trim() || environment.R2_BUCKET_NAME?.trim();

  if (!bucketName) {
    throw new Error("Missing R2_BUCKET.");
  }

  return bucketName;
}
