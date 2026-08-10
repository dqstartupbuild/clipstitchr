export async function readSocialPublishingJsonResponse<ResponseBody>(
  response: Response,
): Promise<ResponseBody> {
  try {
    return JSON.parse(await response.text()) as ResponseBody;
  } catch {
    throw new Error(
      "Zernio returned an unexpected response. Please try again in a moment.",
    );
  }
}
