import { confirm, input } from "@inquirer/prompts";
import type { DemoAgentPolicy } from "../demoAgent/DemoAgentPolicy.js";
import { normalizeDemoAgentPolicy } from "../demoAgent/normalizeDemoAgentPolicy.js";
import { logInfo } from "../terminal/logInfo.js";
import { logKeyValue } from "../terminal/logKeyValue.js";
import { logSection } from "../terminal/logSection.js";
import { formatDemoAgentPolicyList } from "./formatDemoAgentPolicyList.js";
import { formatDemoAgentPolicyRecord } from "./formatDemoAgentPolicyRecord.js";
import { getDemoAgentPolicyHasLiveOrigins } from "./getDemoAgentPolicyHasLiveOrigins.js";
import { normalizeDemoAgentPolicyOrigins } from "./normalizeDemoAgentPolicyOrigins.js";
import { parseDemoAgentPolicyList } from "./parseDemoAgentPolicyList.js";
import { parseDemoAgentPolicyRecord } from "./parseDemoAgentPolicyRecord.js";
import { readDemoAgentPolicyInteger } from "./readDemoAgentPolicyInteger.js";

export async function editDemoAgentPolicy(policy: DemoAgentPolicy) {
  logSection("Safety policy");
  logInfo("Press Enter to keep a value when you edit.");
  logKeyValue("Allowed app URLs", policy.allowedOrigins.join(", "));
  logKeyValue("Allowed pages", policy.allowedRoutes.join(", "));
  logKeyValue("Live sites", policy.allowLiveOrigins ? "Allowed" : "Not allowed");
  logKeyValue("Uploads", policy.allowFileUploads ? "Allowed" : "Not allowed");
  logKeyValue("Max actions", String(policy.maxActions));
  logKeyValue("Max recording time", `${policy.maxRecordingSeconds} seconds`);

  const shouldUseCurrentPolicy = await confirm({
    default: true,
    message: "Use these safety settings?",
  });

  if (shouldUseCurrentPolicy) {
    const allowLiveOrigins = getDemoAgentPolicyHasLiveOrigins(
      policy.allowedOrigins,
    )
      ? await confirm({
          default: policy.allowLiveOrigins === true,
          message: "Allow the agent to use live, non-local app URLs?",
        })
      : policy.allowLiveOrigins === true;

    return normalizeDemoAgentPolicy({
      ...policy,
      allowLiveOrigins: allowLiveOrigins ? true : undefined,
    });
  }

  const allowedOrigins = normalizeDemoAgentPolicyOrigins(
    parseDemoAgentPolicyList(
      await input({
        default: formatDemoAgentPolicyList(policy.allowedOrigins),
        message: "Allowed app URLs:",
      }),
    ),
  );
  const allowLiveOrigins = getDemoAgentPolicyHasLiveOrigins(allowedOrigins)
    ? await confirm({
        default: policy.allowLiveOrigins === true,
        message: "Allow the agent to use live, non-local app URLs?",
      })
    : false;
  const allowedRoutes = parseDemoAgentPolicyList(
    await input({
      default: formatDemoAgentPolicyList(policy.allowedRoutes),
      message: "Allowed pages or routes:",
    }),
  );
  const maxActions = readDemoAgentPolicyInteger({
    fallback: policy.maxActions,
    maximum: 200,
    minimum: 1,
    value: await input({
      default: String(policy.maxActions),
      message: "Max agent actions:",
    }),
  });
  const maxRecordingSeconds = readDemoAgentPolicyInteger({
    fallback: policy.maxRecordingSeconds,
    maximum: 600,
    minimum: 10,
    value: await input({
      default: String(policy.maxRecordingSeconds),
      message: "Max recording seconds:",
    }),
  });
  const approvedTestValues = parseDemoAgentPolicyRecord(
    await input({
      default: formatDemoAgentPolicyRecord(policy.approvedTestValues),
      message: "Approved test values (name=value):",
    }),
  );
  const blockedTextPatterns = parseDemoAgentPolicyList(
    await input({
      default: formatDemoAgentPolicyList(policy.blockedTextPatterns),
      message: "Blocked text patterns:",
    }),
  );
  const allowFileUploads = await confirm({
    default: policy.allowFileUploads,
    message: "Allow file uploads?",
  });
  const approvedUploadFiles = allowFileUploads
    ? parseDemoAgentPolicyList(
        await input({
          default: formatDemoAgentPolicyList(policy.approvedUploadFiles),
          message: "Approved upload files:",
        }),
      )
    : [];

  if (allowFileUploads && approvedUploadFiles.length === 0) {
    throw new Error("File uploads need at least one approved file.");
  }

  const requiresApprovalBeforeUpload = allowFileUploads
    ? await confirm({
        default: policy.requiresApprovalBeforeUpload,
        message: "Ask before every upload?",
      })
    : true;
  const testAccountNotes = await input({
    default: policy.testAccountNotes ?? "",
    message: "Test account notes:",
  });

  return normalizeDemoAgentPolicy({
    ...policy,
    allowFileUploads,
    allowLiveOrigins: allowLiveOrigins ? true : undefined,
    allowedOrigins,
    allowedRoutes,
    approvedTestValues,
    approvedUploadFiles,
    blockedTextPatterns,
    maxActions,
    maxRecordingSeconds,
    requiresApprovalBeforeUpload,
    testAccountNotes: testAccountNotes.trim() || undefined,
  });
}
