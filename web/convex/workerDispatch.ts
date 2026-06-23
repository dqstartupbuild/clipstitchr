import { v } from "convex/values";
import { action, internalAction } from "./_generated/server";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";

type GoogleAccessTokenResponse = {
  access_token?: unknown;
  error?: unknown;
  error_description?: unknown;
};

type CloudRunJobRunResponse = {
  name?: unknown;
};

const tokenUrl = "https://oauth2.googleapis.com/token";
const cloudPlatformScope = "https://www.googleapis.com/auth/cloud-platform";

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing ${name}.`);
  }

  return value;
}

function getWorkerJobName(worker: "media" | "provider") {
  return worker === "provider"
    ? getRequiredEnv("CLOUD_RUN_PROVIDER_WORKER_JOB")
    : getRequiredEnv("CLOUD_RUN_MEDIA_WORKER_JOB");
}

function base64UrlEncode(value: ArrayBuffer | string) {
  const bytes =
    typeof value === "string"
      ? new TextEncoder().encode(value)
      : new Uint8Array(value);
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decodePemPrivateKey(privateKey: string) {
  const normalized = privateKey.replaceAll("\\n", "\n");
  const base64 = normalized
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

async function createSignedJwt({
  clientEmail,
  privateKey,
}: {
  clientEmail: string;
  privateKey: string;
}) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = {
    alg: "RS256",
    typ: "JWT",
  };
  const claim = {
    aud: tokenUrl,
    exp: nowSeconds + 3600,
    iat: nowSeconds,
    iss: clientEmail,
    scope: cloudPlatformScope,
  };
  const unsignedJwt = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(claim),
  )}`;
  const key = await crypto.subtle.importKey(
    "pkcs8",
    decodePemPrivateKey(privateKey),
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsignedJwt),
  );

  return `${unsignedJwt}.${base64UrlEncode(signature)}`;
}

async function getAccessToken() {
  const assertion = await createSignedJwt({
    clientEmail: getRequiredEnv("CLOUD_RUN_DISPATCH_CLIENT_EMAIL"),
    privateKey: getRequiredEnv("CLOUD_RUN_DISPATCH_PRIVATE_KEY"),
  });
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      assertion,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }),
  });
  const body = (await response.json()) as GoogleAccessTokenResponse;

  if (!response.ok || typeof body.access_token !== "string") {
    const message =
      typeof body.error_description === "string"
        ? body.error_description
        : typeof body.error === "string"
          ? body.error
          : "Unable to authorize Cloud Run dispatch.";

    throw new Error(message);
  }

  return body.access_token;
}

async function dispatchCloudRunWorker(worker: "media" | "provider") {
  const projectId = getRequiredEnv("CLOUD_RUN_PROJECT_ID");
  const location = getRequiredEnv("CLOUD_RUN_LOCATION");
  const jobName = getWorkerJobName(worker);
  const token = await getAccessToken();
  const response = await fetch(
    `https://run.googleapis.com/v2/projects/${projectId}/locations/${location}/jobs/${jobName}:run`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: "{}",
    },
  );
  const body = (await response.json()) as CloudRunJobRunResponse;

  if (!response.ok) {
    throw new Error(`Cloud Run ${worker} worker dispatch failed.`);
  }

  return {
    worker,
    executionName: typeof body.name === "string" ? body.name : null,
  };
}

export const runWorker = internalAction({
  args: {
    worker: v.union(v.literal("media"), v.literal("provider")),
  },
  handler: async (_ctx, { worker }) => await dispatchCloudRunWorker(worker),
});

export const runWorkerFromApi = action({
  args: {
    secret: v.string(),
    worker: v.union(v.literal("media"), v.literal("provider")),
  },
  handler: async (_ctx, { secret, worker }) => {
    assertAutomationWorkerSecret(secret);

    return await dispatchCloudRunWorker(worker);
  },
});
