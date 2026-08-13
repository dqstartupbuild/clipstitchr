import { InvalidServiceAssertionError } from "../errors/InvalidServiceAssertionError.js";
import type { ServiceAssertionClaims } from "../assertions/ServiceAssertionClaims.js";
import { verifyServiceAssertion } from "../assertions/verifyServiceAssertion.js";
import type { AuthenticatePublishingServiceRequestInput } from "./AuthenticatePublishingServiceRequestInput.js";
import { PublishingServiceHttpError } from "./PublishingServiceHttpError.js";
import { readPublishingServiceAssertion } from "./readPublishingServiceAssertion.js";
import { readPublishingServiceRequestId } from "./readPublishingServiceRequestId.js";

export const authenticatePublishingServiceRequest = async (
  input: AuthenticatePublishingServiceRequestInput,
): Promise<ServiceAssertionClaims> => {
  const requestId = readPublishingServiceRequestId(input.headers);
  const assertion = readPublishingServiceAssertion(input.headers);

  try {
    return await verifyServiceAssertion({
      assertion,
      expectedAction: input.expectedAction,
      expectedAudience: input.expectedAudience,
      expectedIssuer: input.expectedIssuer,
      expectedRequestId: requestId,
      replayProtector: input.replayProtector,
      signingKey: input.signingKey,
      ...(input.nowEpochSeconds === undefined
        ? {}
        : { nowEpochSeconds: input.nowEpochSeconds }),
    });
  } catch (error) {
    if (error instanceof InvalidServiceAssertionError) {
      throw new PublishingServiceHttpError(401, "authentication_required");
    }

    throw error;
  }
};
