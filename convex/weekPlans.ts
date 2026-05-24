import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { WeekPlan } from "../src/lib/types";

export const get = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    const doc = await ctx.db
      .query("weekPlans")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .order("desc")
      .first();
    if (!doc) return null;
    return JSON.parse(doc.planJson) as WeekPlan;
  },
});

export const save = mutation({
  args: {
    sessionId: v.string(),
    createdAt: v.string(),
    planJson: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("weekPlans")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
    return ctx.db.insert("weekPlans", args);
  },
});
