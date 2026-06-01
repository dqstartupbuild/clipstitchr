import { getAutomationWorkerSecret } from "./getAutomationWorkerSecret";

export function getIsAuthorizedAutomationRequest(request: Request) {
  const secret = getAutomationWorkerSecret();
  const authorization = request.headers.get("authorization");
  const headerSecret = request.headers.get("x-automation-worker-secret");

  return authorization === `Bearer ${secret}` || headerSecret === secret;
}
