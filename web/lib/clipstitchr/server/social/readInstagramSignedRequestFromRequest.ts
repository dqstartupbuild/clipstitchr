import { readInstagramSignedRequest } from "./readInstagramSignedRequest";
import { readSocialRequestBody } from "./readSocialRequestBody";

export async function readInstagramSignedRequestFromRequest(request: Request) {
  const body = await readSocialRequestBody(request);
  const signedRequest = new URLSearchParams(body).get("signed_request");

  if (!signedRequest) {
    throw new Error("Instagram signed request is missing.");
  }

  return readInstagramSignedRequest(signedRequest);
}
