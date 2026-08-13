import type { HookLabCreativeBriefContent } from "../HookLabCreativeBriefContent";
import type { ProductProfile } from "../ProductProfile";
import type { StudioStitchAssetRef } from "./StudioStitchAssetRef";
import type { StudioStitchClassicHookFamily } from "./StudioStitchClassicHookFamily";
import type { StudioStitchProviderAvailabilityInput } from "./StudioStitchProviderAvailabilityInput";
import type { StudioStitchSourceAssetInput } from "./StudioStitchSourceAssetInput";

export type StudioStitchClassicReelPlanInput = {
  readonly id: string;
  readonly product: ProductProfile;
  readonly creativeBrief: HookLabCreativeBriefContent;
  readonly hookFamily: StudioStitchClassicHookFamily;
  readonly hookText?: string;
  readonly supportingText?: string;
  readonly ctaText?: string;
  readonly targetDurationSeconds: number;
  readonly reaction: StudioStitchSourceAssetInput;
  readonly demo: StudioStitchSourceAssetInput;
  readonly cutaways: readonly StudioStitchSourceAssetInput[];
  readonly musicSource: StudioStitchAssetRef | null;
  readonly musicVolume?: number;
  readonly providerAvailability: readonly StudioStitchProviderAvailabilityInput[];
};
