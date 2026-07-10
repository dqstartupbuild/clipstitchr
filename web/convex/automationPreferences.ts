import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { getIsAutomationToolEnabled } from "../lib/clipstitchr/constants/automationToolFeatureFlags";
import { defaultAutomationGenerationCount } from "../lib/clipstitchr/constants/defaultAutomationGenerationCount";
import { defaultAutomationStitchrColorChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrColorChoice";
import { defaultAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/constants/defaultAutomationStitchrTextStyleChoice";
import { defaultSwiprCallToActionStyle } from "../lib/clipstitchr/constants/defaultSwiprCallToActionStyle";
import { getAutomationGenerationCount } from "../lib/clipstitchr/utils/getAutomationGenerationCount";
import { getAutomationCliprGenerationMode } from "../lib/clipstitchr/utils/getAutomationCliprGenerationMode";
import { getAutomationStitchrColorChoice } from "../lib/clipstitchr/utils/getAutomationStitchrColorChoice";
import { getAutomationStitchrTextStyleChoice } from "../lib/clipstitchr/utils/getAutomationStitchrTextStyleChoice";
import { normalizeAutomationStitchrTemplateAllocations } from "../lib/clipstitchr/utils/normalizeAutomationStitchrTemplateAllocations";
import { normalizeAutomationSwiprSelectedLibraryPackNames } from "../lib/clipstitchr/utils/normalizeAutomationSwiprSelectedLibraryPackNames";
import { getSwiprCallToActionStyle } from "../lib/clipstitchr/utils/getSwiprCallToActionStyle";
import { normalizeSwiprCreativeContext } from "../lib/clipstitchr/utils/normalizeSwiprCreativeContext";
import { assertProductBelongsToOwner } from "./assertProductBelongsToOwner";
import { getAutomationPreferenceForProduct } from "./getAutomationPreferenceForProduct";
import { rateLimiter } from "./rateLimiter";
import { automationGenerationCountValidator } from "./validators/automationGenerationCount";
import { automationSelectionModeValidator } from "./validators/automationSelectionMode";
import { automationStitchrTemplateAllocationValidator } from "./validators/automationStitchrTemplateAllocation";
import { automationStitchrTextStyleChoiceValidator } from "./validators/automationStitchrTextStyleChoice";
import { automationToolValidator } from "./validators/automationTool";
import { automationCliprGenerationModeValidator } from "./validators/automationCliprGenerationMode";
import { swiprCallToActionStyleValidator } from "./validators/swiprCallToActionStyle";
import type { AutomationTool } from "../lib/clipstitchr/types/AutomationTool";

function filterEnabledAutomationTools(tools: AutomationTool[]) {
  return Array.from(new Set(tools)).filter(getIsAutomationToolEnabled);
}

export const get = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await assertProductBelongsToOwner(ctx, ownerId, productId);

    const preferences = await getAutomationPreferenceForProduct(
      ctx,
      ownerId,
      productId,
    );

    return preferences
      ? {
          ...preferences,
          productId: preferences.productId ?? productId,
          enabledTools: filterEnabledAutomationTools(preferences.enabledTools),
          cliprGenerationMode: getAutomationCliprGenerationMode(
            preferences.cliprGenerationMode,
          ),
          stitchrGenerationCount: getAutomationGenerationCount(
            preferences.stitchrGenerationCount,
          ),
          stitchrTextStyleChoice: getAutomationStitchrTextStyleChoice(
            preferences.stitchrTextStyleChoice,
          ),
          stitchrTextColorChoice: getAutomationStitchrColorChoice(
            preferences.stitchrTextColorChoice,
          ),
          stitchrTextBackgroundColorChoice: getAutomationStitchrColorChoice(
            preferences.stitchrTextBackgroundColorChoice,
          ),
          stitchrTextStrokeColorChoice: getAutomationStitchrColorChoice(
            preferences.stitchrTextStrokeColorChoice,
          ),
          stitchrTemplateAllocations:
            normalizeAutomationStitchrTemplateAllocations(
              preferences.stitchrTemplateAllocations,
              preferences.stitchrGenerationCount,
            ),
          swiprGenerationCount: getAutomationGenerationCount(
            preferences.swiprGenerationCount,
          ),
          swiprCallToActionStyle: getSwiprCallToActionStyle(
            preferences.swiprCallToActionStyle,
          ),
          swiprCreativeContext: normalizeSwiprCreativeContext(
            preferences.swiprCreativeContext,
          ),
          swiprSelectedLibraryPackNames:
            normalizeAutomationSwiprSelectedLibraryPackNames(
              preferences.swiprSelectedLibraryPackNames ?? [],
            ),
          swiprTextStyleChoice: getAutomationStitchrTextStyleChoice(
            preferences.swiprTextStyleChoice,
          ),
          swiprTextColorChoice: getAutomationStitchrColorChoice(
            preferences.swiprTextColorChoice,
          ),
          swiprTextBackgroundColorChoice: getAutomationStitchrColorChoice(
            preferences.swiprTextBackgroundColorChoice,
          ),
          swiprTextStrokeColorChoice: getAutomationStitchrColorChoice(
            preferences.swiprTextStrokeColorChoice,
          ),
        }
      : null;
  },
});

export const save = mutation({
  args: {
    productId: v.optional(v.string()),
    enabled: v.boolean(),
    enabledTools: v.array(automationToolValidator),
    cliprGenerationMode: v.optional(automationCliprGenerationModeValidator),
    stitchrGenerationCount: v.optional(automationGenerationCountValidator),
    stitchrTextStyleChoice: v.optional(
      automationStitchrTextStyleChoiceValidator,
    ),
    stitchrTextColorChoice: v.optional(v.string()),
    stitchrTextBackgroundColorChoice: v.optional(v.string()),
    stitchrTextStrokeColorChoice: v.optional(v.string()),
    stitchrTemplateAllocations: v.optional(
      v.array(automationStitchrTemplateAllocationValidator),
    ),
    swiprGenerationCount: v.optional(automationGenerationCountValidator),
    swiprCallToActionStyle: v.optional(swiprCallToActionStyleValidator),
    swiprCreativeContext: v.optional(v.string()),
    swiprSelectedLibraryPackNames: v.optional(v.array(v.string())),
    swiprTextStyleChoice: v.optional(automationStitchrTextStyleChoiceValidator),
    swiprTextColorChoice: v.optional(v.string()),
    swiprTextBackgroundColorChoice: v.optional(v.string()),
    swiprTextStrokeColorChoice: v.optional(v.string()),
    productSelectionMode: automationSelectionModeValidator,
    selectedProductIds: v.array(v.string()),
    avatarSelectionMode: automationSelectionModeValidator,
    selectedAvatarIds: v.array(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    const existing = args.productId
      ? await ctx.db
          .query("automationPreferences")
          .withIndex("by_owner_product", (q) =>
            q.eq("ownerId", ownerId).eq("productId", args.productId),
          )
          .unique()
      : await ctx.db
          .query("automationPreferences")
          .withIndex("by_owner_product", (q) =>
            q.eq("ownerId", ownerId).eq("productId", undefined),
          )
          .unique();

    await rateLimiter.limit(
      ctx,
      existing ? "convexMetadataUpdate" : "convexRecordSave",
      {
        key: ownerId,
        throws: true,
      },
    );

    const productIds = Array.from(new Set(args.selectedProductIds));
    const avatarIds = Array.from(new Set(args.selectedAvatarIds));
    const selectedProductIds = args.productId ? [args.productId] : productIds;
    const stitchrGenerationCount = getAutomationGenerationCount(
      args.stitchrGenerationCount ?? defaultAutomationGenerationCount,
    );
    const requestedStitchrTemplateAllocations =
      normalizeAutomationStitchrTemplateAllocations(
        args.stitchrTemplateAllocations,
        stitchrGenerationCount,
      );
    const requestedTemplateIds = new Set(
      requestedStitchrTemplateAllocations.map(
        (allocation) => allocation.templateId,
      ),
    );
    const ownedStitchTemplateIds = requestedTemplateIds.size
      ? new Set<string>()
      : undefined;

    if (ownedStitchTemplateIds) {
      for (const templateId of requestedTemplateIds) {
        const template = await ctx.db
          .query("stitchTemplates")
          .withIndex("by_owner_id", (q) =>
            q.eq("ownerId", ownerId).eq("id", templateId),
          )
          .unique();

        if (template) {
          ownedStitchTemplateIds.add(template.id);
        }
      }
    }

    if (
      ownedStitchTemplateIds &&
      [...requestedTemplateIds].some(
        (templateId) => !ownedStitchTemplateIds.has(templateId),
      )
    ) {
      throw new Error("Choose templates from your account.");
    }

    const preferences = {
      ownerId,
      productId: args.productId,
      enabled: args.enabled,
      enabledTools: filterEnabledAutomationTools(args.enabledTools),
      cliprGenerationMode: getAutomationCliprGenerationMode(
        args.cliprGenerationMode,
      ),
      stitchrGenerationCount,
      stitchrTextStyleChoice:
        args.stitchrTextStyleChoice ?? defaultAutomationStitchrTextStyleChoice,
      stitchrTextColorChoice: getAutomationStitchrColorChoice(
        args.stitchrTextColorChoice ?? defaultAutomationStitchrColorChoice,
      ),
      stitchrTextBackgroundColorChoice: getAutomationStitchrColorChoice(
        args.stitchrTextBackgroundColorChoice ??
          defaultAutomationStitchrColorChoice,
      ),
      stitchrTextStrokeColorChoice: getAutomationStitchrColorChoice(
        args.stitchrTextStrokeColorChoice ??
          defaultAutomationStitchrColorChoice,
      ),
      stitchrTemplateAllocations: normalizeAutomationStitchrTemplateAllocations(
        requestedStitchrTemplateAllocations,
        stitchrGenerationCount,
        ownedStitchTemplateIds,
      ),
      swiprGenerationCount: getAutomationGenerationCount(
        args.swiprGenerationCount ?? defaultAutomationGenerationCount,
      ),
      swiprCallToActionStyle: getSwiprCallToActionStyle(
        args.swiprCallToActionStyle ?? defaultSwiprCallToActionStyle,
      ),
      swiprCreativeContext:
        normalizeSwiprCreativeContext(args.swiprCreativeContext) || undefined,
      swiprSelectedLibraryPackNames:
        normalizeAutomationSwiprSelectedLibraryPackNames(
          args.swiprSelectedLibraryPackNames ?? [],
        ),
      swiprTextStyleChoice:
        args.swiprTextStyleChoice ?? defaultAutomationStitchrTextStyleChoice,
      swiprTextColorChoice: getAutomationStitchrColorChoice(
        args.swiprTextColorChoice ?? defaultAutomationStitchrColorChoice,
      ),
      swiprTextBackgroundColorChoice: getAutomationStitchrColorChoice(
        args.swiprTextBackgroundColorChoice ??
          defaultAutomationStitchrColorChoice,
      ),
      swiprTextStrokeColorChoice: getAutomationStitchrColorChoice(
        args.swiprTextStrokeColorChoice ?? defaultAutomationStitchrColorChoice,
      ),
      productSelectionMode: args.productId
        ? "selected"
        : args.productSelectionMode,
      selectedProductIds:
        args.productId || args.productSelectionMode === "selected"
          ? selectedProductIds
          : [],
      avatarSelectionMode: args.avatarSelectionMode,
      selectedAvatarIds:
        args.avatarSelectionMode === "selected" ? avatarIds : [],
      preferenceVersion: (existing?.preferenceVersion ?? 0) + 1,
      createdAt: existing?.createdAt ?? args.updatedAt,
      updatedAt: args.updatedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, preferences);
      return existing._id;
    }

    return await ctx.db.insert("automationPreferences", preferences);
  },
});
