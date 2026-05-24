import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { sessionId: v.string() },
  handler: async (ctx, { sessionId }) => {
    return ctx.db
      .query("ingredients")
      .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
      .collect();
  },
});

export const add = mutation({
  args: {
    sessionId: v.string(),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    servingSize: v.number(),
    unit: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("ingredients", args);
  },
});

export const remove = mutation({
  args: { id: v.id("ingredients") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
