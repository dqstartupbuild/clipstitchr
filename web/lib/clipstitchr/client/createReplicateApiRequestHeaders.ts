"use client";

import { REPLICATE_API_TOKEN_HEADER_NAME } from "@/lib/clipstitchr/constants/replicateApiTokenHeaderName";
import { getStoredReplicateApiToken } from "@/lib/clipstitchr/client/getStoredReplicateApiToken";

export function createReplicateApiRequestHeaders() {
  const headers = new Headers();
  const token = getStoredReplicateApiToken();

  if (token) {
    headers.set(REPLICATE_API_TOKEN_HEADER_NAME, token);
  }

  return headers;
}
