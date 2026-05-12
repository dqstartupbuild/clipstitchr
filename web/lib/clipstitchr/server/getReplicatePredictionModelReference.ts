type ReplicatePredictionModelReference =
  | {
      model: string;
    }
  | {
      version: string;
    };

export function getReplicatePredictionModelReference(
  modelId: string,
): ReplicatePredictionModelReference {
  const trimmedModelId = modelId.trim();
  const versionSeparatorIndex = trimmedModelId.indexOf(":");

  if (versionSeparatorIndex === -1) {
    return {
      model: trimmedModelId,
    };
  }

  return {
    version: trimmedModelId.slice(versionSeparatorIndex + 1).trim(),
  };
}
