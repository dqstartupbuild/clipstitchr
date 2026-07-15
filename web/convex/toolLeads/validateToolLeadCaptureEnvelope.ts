import { browserRecognitionLifetimeMs } from "../browserRecognition/browserRecognitionLifetimeMs";
import { emailConfirmationLifetimeMs } from "../email/emailConfirmationLifetimeMs";

const digestPattern = /^[a-f0-9]{64}$/;
const opaqueIdPattern = /^[A-Za-z0-9_-]{32,128}$/;
const providerContactKeyPattern = /^[A-Za-z0-9_-]{32,160}$/;

export function validateToolLeadCaptureEnvelope(args: {
  capturedAt: number;
  clientKey: string;
  confirmationExpiresAt: number;
  consentCopyVersion: string;
  courseSessionTokenHash?: string;
  previousRecognitionTokenHash?: string;
  providerContactKey: string;
  recognitionExpiresAt: number;
  recognitionTokenHash: string;
  tokenDigest: string;
  tokenRecordId: string;
}) {
  if (!digestPattern.test(args.clientKey)) throw new Error("Invalid client key.");
  if (!providerContactKeyPattern.test(args.providerContactKey)) {
    throw new Error("Invalid contact key.");
  }
  if (
    !digestPattern.test(args.recognitionTokenHash) ||
    (args.courseSessionTokenHash !== undefined &&
      !digestPattern.test(args.courseSessionTokenHash)) ||
    (args.previousRecognitionTokenHash !== undefined &&
      !digestPattern.test(args.previousRecognitionTokenHash))
  ) {
    throw new Error("Invalid recognition token.");
  }
  if (
    !opaqueIdPattern.test(args.tokenRecordId) ||
    !digestPattern.test(args.tokenDigest)
  ) {
    throw new Error("Invalid confirmation token.");
  }
  if (args.consentCopyVersion !== "public-tools-v1") {
    throw new Error("Invalid consent version.");
  }
  if (
    !Number.isFinite(args.capturedAt) ||
    args.recognitionExpiresAt !==
      args.capturedAt + browserRecognitionLifetimeMs ||
    args.confirmationExpiresAt !==
      args.capturedAt + emailConfirmationLifetimeMs
  ) {
    throw new Error("Invalid capture time.");
  }
}
