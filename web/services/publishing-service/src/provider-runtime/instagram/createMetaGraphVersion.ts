import { ProviderRuntimeError } from "../errors/ProviderRuntimeError.js";
import type { MetaGraphVersion } from "./MetaGraphVersion.js";

export const createMetaGraphVersion = (value: string): MetaGraphVersion => {
  if (!/^v\d{1,2}\.\d+$/.test(value)) {
    throw new ProviderRuntimeError("instagram", "invalid_configuration");
  }

  return value as MetaGraphVersion;
};
