import type { HookLabCreativeBriefContent } from "../HookLabCreativeBriefContent";
import type { ProductProfile } from "../ProductProfile";
import type { StudioStitchAssetRef } from "./StudioStitchAssetRef";
import type { StudioStitchProviderAvailabilityInput } from "./StudioStitchProviderAvailabilityInput";
import type { StudioStitchSourceAssetInput } from "./StudioStitchSourceAssetInput";
import type { StudioStitchTalkingHookFamily } from "./StudioStitchTalkingHookFamily";
import type { StudioStitchVoiceInput } from "./StudioStitchVoiceInput";

export type StudioStitchTalkingVideoPlanInput = {
  readonly id: string;
  readonly product: ProductProfile;
  readonly creativeBrief: HookLabCreativeBriefContent;
  readonly hookFamily: StudioStitchTalkingHookFamily;
  readonly hookText?: string;
  readonly voiceScript?: string;
  readonly ctaText?: string;
  readonly targetDurationSeconds: number;
  readonly reactionSources: readonly StudioStitchSourceAssetInput[];
  readonly demoSources: readonly StudioStitchSourceAssetInput[];
  readonly voice: StudioStitchVoiceInput;
  readonly emphasisWords: readonly string[];
  readonly musicSource: StudioStitchAssetRef | null;
  readonly musicVolume?: number;
  readonly providerAvailability: readonly StudioStitchProviderAvailabilityInput[];
};
