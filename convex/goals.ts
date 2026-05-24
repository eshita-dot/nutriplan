import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    return ctx.db
      .query("goals")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    sessionId: v.string(),
    dailyCalories: v.number(),
    proteinGrams: v.number(),
    carbsGrams: v.number(),
    fatGrams: v.number(),
    mealsPerDay: v.number(),
    includeSnacks: v.boolean(),
    dietaryRestrictions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("goals")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, args);
    } else {
      await ctx.db.insert("goals", args);
    }
  },
});
