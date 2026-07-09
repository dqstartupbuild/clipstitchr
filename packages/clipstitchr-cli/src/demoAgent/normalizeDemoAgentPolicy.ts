import { resolve } from "node:path";
import type { DemoAgentPolicy } from "./DemoAgentPolicy.js";
import { getDemoAgentOriginIsHttp } from "./getDemoAgentOriginIsHttp.js";
import { getIsDemoAgentLocalOrigin } from "./getIsDemoAgentLocalOrigin.js";

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function readStringRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter((entry): entry is [string, string] => typeof entry[1] === "string")
      .map(([key, recordValue]) => [key.trim(), recordValue.trim()])
      .filter(([key, recordValue]) => key && recordValue),
  );
}

function readNumber(value: unknown, fallback: number, min: number, max: number) {
  const number = typeof value === "number" ? Math.round(value) : fallback;

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, number));
}

export function normalizeDemoAgentPolicy(
  value: unknown,
  cwd = process.cwd(),
): DemoAgentPolicy {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Demo agent policy must be a JSON object.");
  }

  const rawPolicy = value as Record<string, unknown>;
  const allowedOrigins = readStringArray(rawPolicy.allowedOrigins).map(
    (origin) => new URL(origin).origin,
  );
  const allowLiveOrigins = rawPolicy.allowLiveOrigins === true;

  if (!allowedOrigins.length || !allowedOrigins.every(getDemoAgentOriginIsHttp)) {
    throw new Error("Demo agent policy needs at least one HTTP app origin.");
  }

  if (!allowLiveOrigins && !allowedOrigins.every(getIsDemoAgentLocalOrigin)) {
    throw new Error(
      "Demo agent policy can only allow local app origins unless live origins are explicitly enabled.",
    );
  }

  const allowedRoutes = readStringArray(rawPolicy.allowedRoutes).map((route) =>
    route.startsWith("/") ? route : `/${route}`,
  );

  if (!allowedRoutes.length) {
    throw new Error("Demo agent policy needs at least one allowed route.");
  }

  const approvedUploadFiles = readStringArray(rawPolicy.approvedUploadFiles).map(
    (filePath) => resolve(cwd, filePath),
  );

  return {
    allowFileUploads:
      rawPolicy.allowFileUploads !== false && approvedUploadFiles.length > 0,
    allowLiveOrigins: allowLiveOrigins ? true : undefined,
    allowedOrigins,
    allowedRoutes,
    approvedTestValues: readStringRecord(rawPolicy.approvedTestValues),
    approvedUploadFiles,
    blockedTextPatterns: readStringArray(rawPolicy.blockedTextPatterns),
    maxActions: readNumber(rawPolicy.maxActions, 80, 1, 200),
    maxRecordingSeconds: readNumber(
      rawPolicy.maxRecordingSeconds,
      180,
      10,
      600,
    ),
    requiresApprovalBeforeUpload:
      rawPolicy.requiresApprovalBeforeUpload !== false,
    stuckStateLimit: readNumber(rawPolicy.stuckStateLimit, 3, 1, 10),
    testAccountNotes:
      typeof rawPolicy.testAccountNotes === "string"
        ? rawPolicy.testAccountNotes.slice(0, 1000)
        : undefined,
    version: 1,
  };
}
