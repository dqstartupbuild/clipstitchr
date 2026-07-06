import { requestJson } from "./requestJson.js";

export type DeviceTokenResponse = {
  accessToken: string;
  expiresAt: string;
  sessionId: string;
  tokenType: "Bearer";
} | {
  status: "authorization_pending" | "expired_token" | "invalid_request";
};

export async function exchangeDeviceAuthorization(
  apiBaseUrl: string,
  deviceCode: string,
) {
  return await requestJson<DeviceTokenResponse>(
    { apiBaseUrl },
    "/api/cli/auth/token",
    {
      body: JSON.stringify({ deviceCode }),
      method: "POST",
    },
  );
}
