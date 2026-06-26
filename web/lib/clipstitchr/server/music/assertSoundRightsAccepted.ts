import { soundRightsAgreementVersion } from "@/lib/clipstitchr/constants/soundRightsAgreementVersion";

type SoundPreference = {
  rightsAcceptedAt?: string;
  rightsAgreementVersion?: string;
} | null;

export function assertSoundRightsAccepted(preference: SoundPreference) {
  if (
    !preference?.rightsAcceptedAt ||
    preference.rightsAgreementVersion !== soundRightsAgreementVersion
  ) {
    throw new Error("Confirm sound use before adding sounds.");
  }
}
