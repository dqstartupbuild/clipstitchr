import type { PublishingDispatchAccessAuthorizer } from "./PublishingDispatchAccessAuthorizer.js";
import type { PublishingDispatchAccessAuthorizerOptions } from "./PublishingDispatchAccessAuthorizerOptions.js";
import { readPublishingDispatchAccessResponse } from "./readPublishingDispatchAccessResponse.js";

export const createHttpPublishingDispatchAccessAuthorizer = (
  options: PublishingDispatchAccessAuthorizerOptions,
): PublishingDispatchAccessAuthorizer => {
  const endpoint = new URL(
    "/api/studio/publishing/internal/dispatch-access",
    options.appOrigin,
  );
  const fetchImplementation = options.fetchImplementation ?? globalThis.fetch;

  return async (scope, signal) => {
    const response = await fetchImplementation(endpoint, {
      body: JSON.stringify(scope),
      headers: {
        "content-type": "application/json",
        "x-clipstitchr-publishing-dispatch-secret": options.secret,
      },
      method: "POST",
      redirect: "error",
      signal: AbortSignal.any([signal, AbortSignal.timeout(5_000)]),
    });

    return readPublishingDispatchAccessResponse(response);
  };
};
