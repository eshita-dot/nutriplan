import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  ingredients: defineTable({
    sessionId: v.string(),
    name: v.string(),
    calories: v.number(),
    protein: v.number(),
    carbs: v.number(),
    fat: v.number(),
    servingSize: v.number(),
    unit: v.string(),
  }).index("by_session", ["sessionId"]),

  goals: defineTable({
    sessionId: v.string(),
    dailyCalories: v.number(),
    proteinGrams: v.number(),
    carbsGrams: v.number(),
    fatGrams: v.number(),
    mealsPerDay: v.number(),
    includeSnacks: v.boolean(),
    dietaryRestrictions: v.array(v.string()),
  }).index("by_session", ["sessionId"]),

  weekPlans: defineTable({
    sessionId: v.string(),
    createdAt: v.string(),
    planJson: v.string(),
  }).index("by_session", ["sessionId"]),
});
