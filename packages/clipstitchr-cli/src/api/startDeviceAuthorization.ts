import { requestJson } from "./requestJson.js";

export type DeviceAuthorizationResponse = {
  deviceCode: string;
  expiresIn: number;
  interval: number;
  userCode: string;
  verificationUri: string;
  verificationUriComplete: string;
};

export async function startDeviceAuthorization(apiBaseUrl: string) {
  return await requestJson<DeviceAuthorizationResponse>(
    { apiBaseUrl },
    "/api/cli/auth/device",
    {
      body: JSON.stringify({
        clientName: "ClipStitchr CLI",
        machineName: process.env.USER ?? process.env.USERNAME ?? "This machine",
      }),
      method: "POST",
    },
  );
}
