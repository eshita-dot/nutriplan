"use client";
import { useState, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { RefreshCw, ChevronLeft, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import { Ingredient, NutritionGoals, WeekPlan, Meal } from "@/lib/types";
import { goalDefaults, cn, computeDayTotals } from "@/lib/utils";
import { useSessionId } from "@/lib/useSessionId";
import { IngredientsPanel } from "@/components/IngredientsPanel";
import { GoalsPanel } from "@/components/GoalsPanel";
import { DayColumn } from "@/components/DayColumn";
import { WeekSummary } from "@/components/WeekSummary";

type Tab = "ingredients" | "goals" | "plan";
type Duration = "1" | "3" | "7";

const DURATION_OPTIONS: { value: Duration; label: string }[] = [
  { value: "1", label: "Today" },
  { value: "3", label: "3 Days" },
  { value: "7", label: "Full Week" },
];

export default function Home() {
  const sessionId = useSessionId();

  const convexIngredients = useQuery(api.ingredients.list, sessionId ? { sessionId } : "skip");
  const convexGoals = useQuery(api.goals.get, sessionId ? { sessionId } : "skip");
  const plan = useQuery(api.weekPlans.get, sessionId ? { sessionId } : "skip") as WeekPlan | null | undefined;

  const addIngredient = useMutation(api.ingredients.add);
  const removeIngredient = useMutation(api.ingredients.remove);
  const upsertGoals = useMutation(api.goals.upsert);
  const savePlan = useMutation(api.weekPlans.save);

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

  const [tab, setTab] = useState<Tab>("ingredients");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dayOffset, setDayOffset] = useState(0);
  const [duration, setDuration] = useState<Duration>("7");

  // Partial regen state — format: "dayIndex-mealType" or "day-dayIndex"
  const [regeneratingKey, setRegeneratingKey] = useState<string | null>(null);

  const isLoading = !sessionId || convexIngredients === undefined;

  const handleAdd = useCallback(
    async (item: Omit<Ingredient, "id">) => {
      if (!sessionId) return;
      await addIngredient({ sessionId, ...item });
    },
    [sessionId, addIngredient]
  );

  const handleRemove = useCallback(
    async (id: string) => { await removeIngredient({ id: id as Id<"ingredients"> }); },
    [removeIngredient]
  );

  const handleGoalsChange = useCallback(
    async (newGoals: NutritionGoals) => {
      if (!sessionId) return;
      await upsertGoals({ sessionId, ...newGoals });
    },
    [sessionId, upsertGoals]
  );

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
        body: JSON.stringify({ ingredients, goals, duration }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      await savePlan({ sessionId, createdAt: data.plan.createdAt, planJson: JSON.stringify(data.plan) });
      setTab("plan");
      setDayOffset(0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [sessionId, ingredients, goals, duration, savePlan]);

  // Regenerate a single meal within a day
  const regenerateMeal = useCallback(async (dayIndex: number, mealType: string) => {
    if (!plan || !sessionId) return;
    const key = `${dayIndex}-${mealType}`;
    setRegeneratingKey(key);
    setError(null);
    try {
      const day = plan.days[dayIndex];
      const existingMeals = [
        day.breakfast?.name,
        day.lunch?.name,
        day.dinner?.name,
        ...day.snacks.map((s) => s.name),
      ].filter(Boolean) as string[];

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "meal", ingredients, goals, dayName: day.day, mealType, existingMeals }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      const updatedDays = plan.days.map((d, i) => {
        if (i !== dayIndex) return d;
        let updated = { ...d };
        if (mealType === "breakfast") updated = { ...updated, breakfast: data.meal as Meal };
        else if (mealType === "lunch") updated = { ...updated, lunch: data.meal as Meal };
        else if (mealType === "dinner") updated = { ...updated, dinner: data.meal as Meal };
        else if (mealType.startsWith("snack-")) {
          const snackIdx = parseInt(mealType.split("-")[1]);
          const newSnacks = [...d.snacks];
          newSnacks[snackIdx] = data.meal as Meal;
          updated = { ...updated, snacks: newSnacks };
        }
        return computeDayTotals(updated);
      });

      const updatedPlan = { ...plan, days: updatedDays };
      await savePlan({ sessionId, createdAt: updatedPlan.createdAt, planJson: JSON.stringify(updatedPlan) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegeneratingKey(null);
    }
  }, [plan, sessionId, ingredients, goals, savePlan]);

  // Regenerate an entire day
  const regenerateDay = useCallback(async (dayIndex: number) => {
    if (!plan || !sessionId) return;
    const key = `day-${dayIndex}`;
    setRegeneratingKey(key);
    setError(null);
    try {
      const dayName = plan.days[dayIndex].day;
      const otherDayMeals = plan.days
        .filter((_, i) => i !== dayIndex)
        .map((d) => `${d.day}: ${[d.breakfast?.name, d.lunch?.name, d.dinner?.name].filter(Boolean).join(", ")}`);

      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "day", ingredients, goals, dayName, otherDayMeals }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");

      const updatedDays = plan.days.map((d, i) => i === dayIndex ? data.day : d);
      const updatedPlan = { ...plan, days: updatedDays };
      await savePlan({ sessionId, createdAt: updatedPlan.createdAt, planJson: JSON.stringify(updatedPlan) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Regeneration failed");
    } finally {
      setRegeneratingKey(null);
    }
  }, [plan, sessionId, ingredients, goals, savePlan]);

  const visibleDays = plan ? plan.days.slice(dayOffset, dayOffset + 3) : [];
  const todayIndex = new Date().getDay();

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "ingredients", label: "Pantry", count: ingredients.length },
    { id: "goals", label: "Preferences" },
    { id: "plan", label: "My Plan", count: plan ? plan.days.length : undefined },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--background)" }}>
      {/* Header */}
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-4 flex-wrap">
            {/* Brand */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-lg shadow shadow-teal-100">
                🍽️
              </div>
              <div>
                <h1 className="font-bold text-stone-800 text-sm leading-none">What To Eat</h1>
                <p className="text-xs text-stone-400 leading-none mt-0.5">AI Indian Meal Planner</p>
              </div>
            </div>

            {/* Tabs */}
            <nav className="flex items-center gap-1 flex-1 justify-center">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5",
                    tab === t.id
                      ? "bg-stone-100 text-stone-800 border border-stone-200"
                      : "text-stone-500 hover:text-stone-700 hover:bg-stone-50"
                  )}
                >
                  {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className="w-4 h-4 rounded-full bg-teal-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {t.count > 9 ? "9+" : t.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Duration + Generate */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDuration(opt.value)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      duration === opt.value
                        ? "bg-white text-teal-700 shadow-sm border border-stone-200"
                        : "text-stone-500 hover:text-stone-700"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <button
                onClick={generate}
                disabled={generating || isLoading || ingredients.length === 0}
                className="flex items-center gap-2 bg-teal-500 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow shadow-teal-100"
              >
                {generating ? (
                  <><RefreshCw size={14} className="animate-spin" />Cooking…</>
                ) : (
                  <><Sparkles size={14} />{plan ? "Regenerate" : "Generate"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-sm text-red-700">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
          </div>
        </div>
      )}

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
          </div>
        ) : (
          <>
            {/* Pantry */}
            {tab === "ingredients" && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-stone-800">Your Pantry 🧺</h2>
                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                    Tell us what's in your kitchen — dals, veggies, grains, dairy. The AI cooks only with what you have.
                  </p>
                </div>
                <IngredientsPanel ingredients={ingredients} onAdd={handleAdd} onRemove={handleRemove} />
                {ingredients.length > 0 && (
                  <div className="mt-8 flex justify-between items-center">
                    <p className="text-xs text-stone-400">{ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} added</p>
                    <button
                      onClick={() => setTab("goals")}
                      className="px-5 py-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Next: Preferences →
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Preferences */}
            {tab === "goals" && (
              <div className="max-w-2xl mx-auto">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-stone-800">Your Preferences ⚙️</h2>
                  <p className="text-sm text-stone-500 mt-2 leading-relaxed">
                    How much do you eat and any restrictions? Every meal will be tailored to fit.
                  </p>
                </div>
                <GoalsPanel goals={goals} onChange={handleGoalsChange} />
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={() => setTab("ingredients")}
                    className="px-5 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 rounded-xl text-sm font-semibold transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={generate}
                    disabled={generating || ingredients.length === 0}
                    className="flex items-center gap-2 bg-teal-500 hover:bg-teal-500 disabled:opacity-40 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
                  >
                    {generating ? <><RefreshCw size={15} className="animate-spin" />Cooking…</> : <><Sparkles size={15} />Generate My Plan</>}
                  </button>
                </div>
              </div>
            )}

            {/* Plan */}
            {tab === "plan" && (
              <div className="space-y-6">
                {plan ? (
                  <>
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div>
                        <h2 className="text-2xl font-bold text-stone-800">Your Meal Plan 🍛</h2>
                        <p className="text-xs text-stone-400 mt-1">
                          {new Date(plan.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                          {" · "}{plan.days.length} day{plan.days.length !== 1 ? "s" : ""}
                          {plan.goals.dietaryRestrictions.length > 0 && ` · ${plan.goals.dietaryRestrictions[0]}`}
                        </p>
                      </div>
                      {plan.days.length > 3 && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setDayOffset(Math.max(0, dayOffset - 1))}
                            disabled={dayOffset === 0}
                            className="p-2 bg-white hover:bg-stone-50 disabled:opacity-30 rounded-xl border border-stone-200 transition-colors"
                          >
                            <ChevronLeft size={16} className="text-stone-600" />
                          </button>
                          <span className="text-xs text-stone-500 w-24 text-center font-medium">
                            Days {dayOffset + 1}–{Math.min(dayOffset + 3, plan.days.length)}
                          </span>
                          <button
                            onClick={() => setDayOffset(Math.min(plan.days.length - 3, dayOffset + 1))}
                            disabled={dayOffset >= plan.days.length - 3}
                            className="p-2 bg-white hover:bg-stone-50 disabled:opacity-30 rounded-xl border border-stone-200 transition-colors"
                          >
                            <ChevronRight size={16} className="text-stone-600" />
                          </button>
                        </div>
                      )}
                    </div>

                    <WeekSummary plan={plan} />

                    <div className="flex gap-4 overflow-x-auto pb-4">
                      {visibleDays.map((day, i) => {
                        const absoluteIdx = dayOffset + i;
                        const dayKey = `day-${absoluteIdx}`;
                        return (
                          <DayColumn
                            key={day.day}
                            day={day}
                            goals={plan.goals}
                            isToday={absoluteIdx === (todayIndex === 0 ? 6 : todayIndex - 1)}
                            onRegenerateDay={() => regenerateDay(absoluteIdx)}
                            onRegenerateMeal={(mealType) => regenerateMeal(absoluteIdx, mealType)}
                            regeneratingMeal={regeneratingKey?.startsWith(`${absoluteIdx}-`) ? regeneratingKey.replace(`${absoluteIdx}-`, "") : null}
                            isRegeneratingDay={regeneratingKey === dayKey}
                          />
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="text-6xl mb-6">🍛</div>
                    <h3 className="text-xl font-bold text-stone-800">No plan yet</h3>
                    <p className="text-sm text-stone-500 mt-2 max-w-sm leading-relaxed">
                      Add what's in your kitchen, set your preferences, then hit <strong>Generate</strong>.
                    </p>
                    <button
                      onClick={() => setTab("ingredients")}
                      className="mt-6 px-6 py-3 bg-teal-500 hover:bg-teal-500 rounded-xl text-sm font-bold text-white transition-all"
                    >
                      Start with your pantry →
                    </button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Generating overlay */}
      {generating && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white border border-stone-200 rounded-3xl p-10 text-center max-w-sm mx-4 shadow-2xl">
            <div className="text-5xl mb-6 animate-bounce">🍳</div>
            <div className="w-8 h-8 rounded-full border-2 border-teal-400 border-t-transparent animate-spin mx-auto mb-5" />
            <h3 className="text-lg font-bold text-stone-800">Cooking up your plan</h3>
            <p className="text-sm text-stone-500 mt-2 leading-relaxed">
              The AI is crafting{" "}
              {duration === "1" ? "today's meals" : duration === "3" ? "3 days of meals" : "a week of meals"} —
              real Indian food, matched to your pantry.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
