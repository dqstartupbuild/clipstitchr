import { defaultOpenAiComputerModel } from "./defaultOpenAiComputerModel.js";

export function resolveOpenAiComputerModel(configModel?: string) {
  return configModel?.trim() || defaultOpenAiComputerModel;
}
