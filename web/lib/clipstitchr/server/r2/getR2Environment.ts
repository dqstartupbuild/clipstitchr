import type { R2Environment } from "./R2Environment";
import { getRequiredR2EnvironmentValue } from "./getRequiredR2EnvironmentValue";
import { resolveR2BucketName } from "./resolveR2BucketName";
import { resolveR2Endpoint } from "./resolveR2Endpoint";

export function getR2Environment(): R2Environment {
  return {
    endpoint: resolveR2Endpoint(process.env),
    bucketName: resolveR2BucketName(process.env),
    accessKeyId: getRequiredR2EnvironmentValue("R2_ACCESS_KEY_ID"),
    secretAccessKey: getRequiredR2EnvironmentValue("R2_SECRET_ACCESS_KEY"),
  };
}
