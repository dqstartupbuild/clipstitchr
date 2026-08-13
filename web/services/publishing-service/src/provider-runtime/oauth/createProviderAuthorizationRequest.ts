import type { OAuthAuthorizationStateIssueInput } from "../../oauth/OAuthAuthorizationStateIssueInput.js";
import { createOAuthAuthorizationRequestState } from "../../oauth/createOAuthAuthorizationRequestState.js";
import type { ProviderAuthorizationRequest } from "./ProviderAuthorizationRequest.js";
import type { ProviderAuthorizationRuntime } from "./ProviderAuthorizationRuntime.js";

export const createProviderAuthorizationRequest = async (
  input: Omit<OAuthAuthorizationStateIssueInput, "pkceMode" | "provider"> &
    Readonly<{ runtime: ProviderAuthorizationRuntime }>,
): Promise<ProviderAuthorizationRequest> => {
  const state = await createOAuthAuthorizationRequestState({
    identity: input.identity,
    provider: input.runtime.id,
    pkceMode: input.runtime.pkceMode ?? "none",
    publicOrigin: input.publicOrigin,
    returnPath: input.returnPath,
    store: input.store,
    ...(input.ttlSeconds === undefined ? {} : { ttlSeconds: input.ttlSeconds }),
    ...(input.nowEpochMilliseconds === undefined
      ? {}
      : { nowEpochMilliseconds: input.nowEpochMilliseconds }),
  });

  return Object.freeze({
    ...state,
    authorizationUrl: state.pkceMode === "rfc7636-s256"
      ? input.runtime.createAuthorizationUrl(state.state, state.redirectUri, {
          codeChallenge: state.codeChallenge,
          codeChallengeMethod: state.codeChallengeMethod,
        })
      : input.runtime.createAuthorizationUrl(state.state, state.redirectUri),
  });
};
