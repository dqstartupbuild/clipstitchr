import { readProjectConfig } from "../config/readProjectConfig.js";

export async function getProjectProductId() {
  const config = await readProjectConfig();

  return config.productId;
}
