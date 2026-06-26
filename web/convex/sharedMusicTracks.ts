import { v } from "convex/values";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { assetTagsValidator } from "./validators/assetTags";
import { musicTrackSourceValidator } from "./validators/musicTrackSource";
import { r2ObjectValidator } from "./validators/r2Object";

const MUSIC_TITLE_MAX_LENGTH = 120;
const MUSIC_STYLE_MAX_LENGTH = 80;
const MUSIC_PROMPT_MAX_LENGTH = 2000;
const MUSIC_TAG_MAX_LENGTH = 40;
const MUSIC_TAG_LIMIT = 12;

function normalizeText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, " ").slice(0, maxLength);
}

function normalizeTags(tags: string[]) {
  return Array.from(
    new Set(
      tags
        .map((tag) => normalizeText(tag, MUSIC_TAG_MAX_LENGTH).toLowerCase())
        .filter(Boolean),
    ),
  ).slice(0, MUSIC_TAG_LIMIT);
}

function clientTrackFields(
  track: {
    audioObject: { contentType: string; key: string; size: number };
    createdAt: string;
    durationSeconds: number;
    id: string;
    mimeType: string;
    ownerAudioObject?: { contentType: string; key: string; size: number };
    prompt?: string;
    providerModel?: string;
    providerPredictionId?: string;
    size: number;
    sourceUrl?: string;
    source: "clipr" | "stitchr" | "swipr" | "library" | "tiktok";
    style?: string;
    tags: string[];
    tiktokMusicId?: string;
    title: string;
    uploadedByOwnerId: string;
  },
  ownerId: string,
) {
  const isOwnedByCurrentUser = track.uploadedByOwnerId === ownerId;

  return {
    id: track.id,
    title: track.title,
    tags: track.tags,
    style: track.style,
    durationSeconds: track.durationSeconds,
    audioObject: track.audioObject,
    ownerAudioObject: isOwnedByCurrentUser ? track.ownerAudioObject : undefined,
    mimeType: track.mimeType,
    size: track.size,
    prompt: track.prompt,
    providerModel: track.providerModel,
    providerPredictionId: track.providerPredictionId,
    sourceUrl: track.sourceUrl,
    source: track.source,
    tiktokMusicId: track.tiktokMusicId,
    uploadedByOwnerId: track.uploadedByOwnerId,
    isOwnedByCurrentUser,
    createdAt: track.createdAt,
  };
}

export const list = query({
  args: {},
  handler: async (ctx) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const tracks = await ctx.db
      .query("sharedMusicTracks")
      .withIndex("by_uploaded_owner_created", (q) =>
        q.eq("uploadedByOwnerId", ownerId),
      )
      .order("desc")
      .take(200);

    return tracks.map((track) => clientTrackFields(track, ownerId));
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const track = await ctx.db
      .query("sharedMusicTracks")
      .withIndex("by_uploaded_owner_music_id", (q) =>
        q.eq("uploadedByOwnerId", ownerId).eq("id", id),
      )
      .unique();

    return track ? clientTrackFields(track, ownerId) : null;
  },
});

export const save = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    tags: assetTagsValidator,
    style: v.optional(v.string()),
    durationSeconds: v.number(),
    audioObject: r2ObjectValidator,
    ownerAudioObject: v.optional(r2ObjectValidator),
    mimeType: v.string(),
    size: v.number(),
    prompt: v.optional(v.string()),
    providerModel: v.optional(v.string()),
    providerPredictionId: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    source: musicTrackSourceValidator,
    tiktokMusicId: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const existingTrack = await ctx.db
      .query("sharedMusicTracks")
      .withIndex("by_music_id", (q) => q.eq("id", args.id))
      .unique();
    const title = normalizeText(args.title, MUSIC_TITLE_MAX_LENGTH);

    if (!title) {
      throw new Error("Sound title is required.");
    }

    if (existingTrack) {
      throw new Error("Sound already exists.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    return await ctx.db.insert("sharedMusicTracks", {
      uploadedByOwnerId: ownerId,
      ...args,
      title,
      tags: normalizeTags(args.tags),
      style: args.style
        ? normalizeText(args.style, MUSIC_STYLE_MAX_LENGTH)
        : undefined,
      prompt: args.prompt
        ? normalizeText(args.prompt, MUSIC_PROMPT_MAX_LENGTH)
        : undefined,
    });
  },
});

export const saveFromProvider = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    title: v.string(),
    tags: assetTagsValidator,
    style: v.optional(v.string()),
    durationSeconds: v.number(),
    audioObject: r2ObjectValidator,
    ownerAudioObject: v.optional(r2ObjectValidator),
    mimeType: v.string(),
    size: v.number(),
    prompt: v.optional(v.string()),
    providerModel: v.optional(v.string()),
    providerPredictionId: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    source: musicTrackSourceValidator,
    tiktokMusicId: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, { secret, ownerId, ...args }) => {
    assertProviderWorkerSecret(secret);

    const existingTrack = await ctx.db
      .query("sharedMusicTracks")
      .withIndex("by_music_id", (q) => q.eq("id", args.id))
      .unique();
    const title = normalizeText(args.title, MUSIC_TITLE_MAX_LENGTH);

    if (!title) {
      throw new Error("Sound title is required.");
    }

    if (existingTrack) {
      return existingTrack._id;
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    return await ctx.db.insert("sharedMusicTracks", {
      uploadedByOwnerId: ownerId,
      ...args,
      title,
      tags: normalizeTags(args.tags),
      style: args.style
        ? normalizeText(args.style, MUSIC_STYLE_MAX_LENGTH)
        : undefined,
      prompt: args.prompt
        ? normalizeText(args.prompt, MUSIC_PROMPT_MAX_LENGTH)
        : undefined,
    });
  },
});
