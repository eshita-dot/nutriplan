"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import {
  Salad,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Ingredient, NutritionGoals, WeekPlan } from "@/lib/types";
import { goalDefaults } from "@/lib/utils";
import { useSessionId } from "@/lib/useSessionId";
import { IngredientsPanel } from "@/components/IngredientsPanel";
import { GoalsPanel } from "@/components/GoalsPanel";
import { DayColumn } from "@/components/DayColumn";
import { WeekSummary } from "@/components/WeekSummary";

type Tab = "ingredients" | "goals" | "plan";

export default function Home() {
  const sessionId = useSessionId();

  // Convex queries — "skip" until session ID is ready
  const convexIngredients = useQuery(
    api.ingredients.list,
    sessionId ? { sessionId } : "skip"
  );
  const convexGoals = useQuery(
    api.goals.get,
    sessionId ? { sessionId } : "skip"
  );
  const plan = useQuery(
    api.weekPlans.get,
    sessionId ? { sessionId } : "skip"
  ) as WeekPlan | null | undefined;

  // Convex mutations
  const addIngredient = useMutation(api.ingredients.add);
  const removeIngredient = useMutation(api.ingredients.remove);
  const upsertGoals = useMutation(api.goals.upsert);
  const savePlan = useMutation(api.weekPlans.save);

  // Map Convex docs → app types
  const ingredients: Ingredient[] = (convexIngredients ?? []).map((doc) => ({
    id: doc._id as string,
    name: doc.name,
    calories: doc.calories,
    protein: doc.protein,
    carbs: doc.carbs,
    fat: doc.fat,
    servingSize: doc.servingSize,
    unit: doc.unit,
  }));

  const goals: NutritionGoals = convexGoals
    ? {
        dailyCalories: convexGoals.dailyCalories,
        proteinGrams: convexGoals.proteinGrams,
        carbsGrams: convexGoals.carbsGrams,
        fatGrams: convexGoals.fatGrams,
        mealsPerDay: convexGoals.mealsPerDay,
        includeSnacks: convexGoals.includeSnacks,
        dietaryRestrictions: convexGoals.dietaryRestrictions,
      }
    : goalDefaults();

  // Local UI state
  const [tab, setTab] = useState<Tab>("ingredients");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayOffset, setDayOffset] = useState(0);

  const isLoading = !sessionId || convexIngredients === undefined;

  // Ingredient handlers
  const handleAdd = useCallback(
    async (item: Omit<Ingredient, "id">) => {
      if (!sessionId) return;
      await addIngredient({ sessionId, ...item });
    },
    [sessionId, addIngredient]
  );

  const handleRemove = useCallback(
    async (id: string) => {
      await removeIngredient({ id: id as Id<"ingredients"> });
    },
    [removeIngredient]
  );

  // Goals handler — syncs to Convex on every change
  const handleGoalsChange = useCallback(
    async (newGoals: NutritionGoals) => {
      if (!sessionId) return;
      await upsertGoals({ sessionId, ...newGoals });
    },
    [sessionId, upsertGoals]
  );

  // Generate meal plan
  const generate = useCallback(async () => {
    if (!sessionId || ingredients.length === 0) {
      setError("Add at least one ingredient before generating a meal plan.");
      setTab("ingredients");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, goals }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      await savePlan({
        sessionId,
        createdAt: data.plan.createdAt,
        planJson: JSON.stringify(data.plan),
      });
      setTab("plan");
      setDayOffset(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [sessionId, ingredients, goals, savePlan]);

  const visibleDays = plan ? plan.days.slice(dayOffset, dayOffset + 3) : [];
  const todayIndex = new Date().getDay();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "ingredients", label: "Pantry", count: ingredients.length },
    { id: "goals", label: "Goals" },
    { id: "plan", label: "Meal Plan", count: plan ? 7 : undefined },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
              <Salad size={18} />
            </div>
            <div>
              <h1 className="font-bold text-white text-sm leading-none">NutriPlan</h1>
              <p className="text-xs text-slate-500 leading-none mt-0.5">Indian AI Meal Planner</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  tab === t.id
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                    {t.count > 9 ? "9+" : t.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <button
            onClick={generate}
            disabled={generating || isLoading || ingredients.length === 0}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            {generating ? (
              <><RefreshCw size={15} className="animate-spin" />Generating…</>
            ) : (
              <><Sparkles size={15} />{plan ? "Regenerate" : "Generate Plan"}</>
            )}
          </button>
        </div>
      </header>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-3 bg-red-950/50 border border-red-800 rounded-xl px-4 py-3 text-sm text-red-300">
            <AlertCircle size={16} className="shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-300">✕</button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {tab === "ingredients" && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">Your Pantry</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Add your Indian pantry staples — dals, atta, vegetables, paneer, and more. The AI builds your week using only what you have.
                  </p>
                </div>
                <IngredientsPanel
                  ingredients={ingredients}
                  onAdd={handleAdd}
                  onRemove={handleRemove}
                />
                {ingredients.length > 0 && (
                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setTab("goals")}
                      className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors"
                    >
                      Next: Set your goals →
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === "goals" && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-white">Nutrition Goals</h2>
                  <p className="text-sm text-slate-400 mt-1">
                    Set your calorie and macro targets. Choose Vegetarian, Jain, Sattvic or any other preference — every meal will be tailored accordingly.
                  </p>
                </div>
                <GoalsPanel goals={goals} onChange={handleGoalsChange} />
                <div className="mt-6 flex justify-between">
                  <button
                    onClick={() => setTab("ingredients")}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-medium transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={generate}
                    disabled={generating || ingredients.length === 0}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
                  >
                    {generating ? (
                      <><RefreshCw size={15} className="animate-spin" />Generating…</>
                    ) : (
                      <><Sparkles size={15} />Generate Meal Plan</>
                    )}
                  </button>
                </div>
              </div>
            )}

            {tab === "plan" && (
              <div className="space-y-6">
                {plan ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-white">Your Week</h2>
                        <p className="text-sm text-slate-400 mt-0.5">
                          Generated {new Date(plan.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
                          disabled={dayOffset === 0}
                          className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors"
                        >
                          <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm text-slate-400 w-32 text-center">
                          Days {dayOffset + 1}–{Math.min(dayOffset + 3, plan.days.length)}
                        </span>
                        <button
                          onClick={() => setDayOffset(Math.min(plan.days.length - 3, dayOffset + 1))}
                          disabled={dayOffset >= plan.days.length - 3}
                          className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg transition-colors"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    <WeekSummary plan={plan} />

                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {visibleDays.map((day, i) => (
                        <DayColumn
                          key={day.day}
                          day={day}
                          goals={plan.goals}
                          isToday={dayOffset + i === (todayIndex === 0 ? 6 : todayIndex - 1)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-24 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mb-4">
                      <Salad size={32} className="text-slate-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-white">No meal plan yet</h3>
                    <p className="text-sm text-slate-400 mt-1 max-w-sm">
                      Add your dals, sabzis, and staples to the pantry, set your goals, then hit{" "}
                      <strong>Generate Plan</strong> for a full week of authentic Indian meals.
                    </p>
                    <button
                      onClick={() => setTab("ingredients")}
                      className="mt-6 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-sm font-semibold transition-colors"
                    >
                      Get started →
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {generating && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center max-w-sm mx-4">
            <div className="w-12 h-12 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white">Building your meal plan</h3>
            <p className="text-sm text-slate-400 mt-2">
              Claude AI is crafting 7 days of authentic Indian meals — dals, sabzis, rotis and more — matched to your pantry and nutrition goals…
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
