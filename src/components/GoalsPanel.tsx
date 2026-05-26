"use client";
import { NutritionGoals } from "@/lib/types";
import { cn, CALORIE_PRESETS, getCaloriePresetKey } from "@/lib/utils";

interface Props {
  goals: NutritionGoals;
  onChange: (g: NutritionGoals) => void;
}

const RESTRICTIONS = [
  { label: "🌱 Vegetarian", value: "Vegetarian" },
  { label: "🥦 Vegan", value: "Vegan" },
  { label: "🙏 Jain", value: "Jain (no root vegetables)" },
  { label: "✨ Sattvic", value: "Sattvic (no onion/garlic)" },
  { label: "🥚 Eggetarian", value: "Eggetarian" },
  { label: "🚫🐄 No Beef", value: "No Beef" },
  { label: "🚫🐷 No Pork", value: "No Pork" },
  { label: "🌾 Gluten-free", value: "Gluten-free" },
  { label: "🥛 Dairy-free", value: "Dairy-free" },
  { label: "💉 Diabetic-friendly", value: "Diabetic-friendly" },
  { label: "🧂 Low Sodium", value: "Low Sodium" },
  { label: "☪️ Halal", value: "Halal" },
];

export function GoalsPanel({ goals, onChange }: Props) {
  const activeKey = getCaloriePresetKey(goals.dailyCalories);

  const applyPreset = (preset: (typeof CALORIE_PRESETS)[number]) => {
    onChange({ ...goals, dailyCalories: preset.mid, proteinGrams: preset.protein, carbsGrams: preset.carbs, fatGrams: preset.fat });
  };

  const toggleRestriction = (value: string) => {
    const current = goals.dietaryRestrictions;
    onChange({
      ...goals,
      dietaryRestrictions: current.includes(value)
        ? current.filter((x) => x !== value)
        : [...current, value],
    });
  };

  return (
    <div className="space-y-8">
      {/* Calorie range */}
      <div>
        <p className="text-sm font-bold text-stone-800 mb-1">How much do you eat per day?</p>
        <p className="text-xs text-stone-500 mb-4">Pick a range — the AI targets the middle of it.</p>
        <div className="grid grid-cols-2 gap-3">
          {CALORIE_PRESETS.map((preset) => {
            const active = activeKey === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => applyPreset(preset)}
                className={cn(
                  "relative rounded-2xl p-4 text-left border-2 transition-all",
                  active ? "border-orange-400 bg-orange-50" : "border-stone-200 bg-white hover:border-orange-200 hover:bg-orange-50/50"
                )}
              >
                <div className="text-2xl mb-2">{preset.emoji}</div>
                <div className={cn("font-bold text-sm", active ? "text-orange-700" : "text-stone-700")}>{preset.label}</div>
                <div className="text-xs text-stone-500 mt-0.5">{preset.sublabel}</div>
                <div className={cn("text-xs font-semibold mt-2", active ? "text-orange-500" : "text-stone-400")}>{preset.range}</div>
                {active && (
                  <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Snacks toggle */}
      <div className="flex items-center justify-between bg-white border border-stone-200 rounded-2xl px-5 py-4">
        <div>
          <p className="text-sm font-bold text-stone-800">Evening snack 🍵</p>
          <p className="text-xs text-stone-500 mt-0.5">A light chai-time bite between lunch and dinner</p>
        </div>
        <button
          onClick={() => onChange({ ...goals, includeSnacks: !goals.includeSnacks })}
          className={cn("w-12 h-6 rounded-full transition-colors relative shrink-0", goals.includeSnacks ? "bg-orange-500" : "bg-stone-300")}
        >
          <div className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform", goals.includeSnacks ? "translate-x-7" : "translate-x-1")} />
        </button>
      </div>

      {/* Dietary restrictions */}
      <div>
        <p className="text-sm font-bold text-stone-800 mb-1">Dietary preferences</p>
        <p className="text-xs text-stone-500 mb-4">The AI will strictly follow whatever you select.</p>
        <div className="flex flex-wrap gap-2">
          {RESTRICTIONS.map(({ label, value }) => {
            const active = goals.dietaryRestrictions.includes(value);
            return (
              <button
                key={value}
                onClick={() => toggleRestriction(value)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                  active
                    ? "border-orange-400 bg-orange-50 text-orange-700"
                    : "border-stone-200 bg-white text-stone-600 hover:border-orange-200 hover:bg-orange-50/50"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
