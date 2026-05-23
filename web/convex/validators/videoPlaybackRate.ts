import { v } from "convex/values";

export const videoPlaybackRateValidator = v.union(v.literal(1), v.literal(2));
