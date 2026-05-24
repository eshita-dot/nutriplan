"use client";
import { useState } from "react";
import { NutritionGoals } from "@/lib/types";
import { caloriesFromMacros } from "@/lib/utils";
import { MacroBar } from "./ui/MacroBar";

interface Props {
  goals: NutritionGoals;
  onChange: (g: NutritionGoals) => void;
}

const PRESETS = [
  { label: "Weight Loss", desc: "Light Indian meals", calories: 1600, protein: 100, carbs: 180, fat: 45 },
  { label: "Balanced Thali", desc: "Traditional portions", calories: 2000, protein: 70, carbs: 280, fat: 60 },
  { label: "High Protein", desc: "Dal + paneer focused", calories: 2200, protein: 160, carbs: 220, fat: 65 },
  { label: "Active & Fit", desc: "For daily workouts", calories: 2800, protein: 180, carbs: 350, fat: 80 },
];

const RESTRICTIONS = [
  "Vegetarian",
  "Vegan",
  "Jain (no root vegetables)",
  "Sattvic (no onion/garlic)",
  "Eggetarian",
  "No Beef",
  "No Pork",
  "Gluten-free",
  "Dairy-free",
  "Diabetic-friendly",
  "Low Sodium",
  "Halal",
];

export function GoalsPanel({ goals, onChange }: Props) {
  const [syncCalories, setSyncCalories] = useState(false);

  const update = (patch: Partial<NutritionGoals>) => {
    const next = { ...goals, ...patch };
    if (syncCalories) {
      next.dailyCalories = caloriesFromMacros(next.proteinGrams, next.carbsGrams, next.fatGrams);
    }
    onChange(next);
  };

  const toggleRestriction = (r: string) => {
    const current = goals.dietaryRestrictions;
    onChange({
      ...goals,
      dietaryRestrictions: current.includes(r)
        ? current.filter((x) => x !== r)
        : [...current, r],
    });
  };

  const NumberField = ({
    label,
    field,
    unit,
    min = 0,
    max = 5000,
  }: {
    label: string;
    field: keyof NutritionGoals;
    unit: string;
    min?: number;
    max?: number;
  }) => (
    <div>
      <label className="block text-xs text-slate-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={goals[field] as number}
          onChange={(e) => update({ [field]: parseFloat(e.target.value) || 0 })}
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
        <span className="text-xs text-slate-500 w-8">{unit}</span>
      </div>
    </div>
  );

  const macroCalories = caloriesFromMacros(goals.proteinGrams, goals.carbsGrams, goals.fatGrams);

  return (
    <div className="space-y-5">
      {/* Presets */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Goal presets</p>
        <div className="grid grid-cols-2 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() =>
                onChange({
                  ...goals,
                  dailyCalories: p.calories,
                  proteinGrams: p.protein,
                  carbsGrams: p.carbs,
                  fatGrams: p.fat,
                })
              }
              className="px-3 py-2 bg-slate-800 border border-slate-600 hover:border-emerald-500 rounded-lg text-xs text-slate-300 hover:text-white transition-all text-left"
            >
              <div className="font-semibold">{p.label}</div>
              <div className="text-slate-500">{p.desc}</div>
              <div className="text-emerald-600 mt-0.5">{p.calories} kcal</div>
            </button>
          ))}
        </div>
      </div>

      {/* Calorie target */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Calorie target</p>
        <NumberField label="Daily calories" field="dailyCalories" unit="kcal" max={6000} />
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="sync"
            checked={syncCalories}
            onChange={(e) => setSyncCalories(e.target.checked)}
            className="accent-emerald-500"
          />
          <label htmlFor="sync" className="text-xs text-slate-400">
            Auto-calculate from macros ({macroCalories} kcal)
          </label>
        </div>
      </div>

      {/* Macros */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Macronutrients</p>
        <div className="space-y-3">
          <NumberField label="Protein" field="proteinGrams" unit="g" />
          <NumberField label="Carbohydrates" field="carbsGrams" unit="g" />
          <NumberField label="Fat" field="fatGrams" unit="g" />
        </div>
      </div>

      {/* Preview */}
      <div className="bg-slate-800/50 rounded-xl p-4 space-y-3">
        <p className="text-xs text-slate-500 font-medium">Preview vs targets</p>
        <MacroBar label="Protein" value={goals.proteinGrams} goal={goals.proteinGrams} unit="g" color="bg-blue-500" />
        <MacroBar label="Carbs" value={goals.carbsGrams} goal={goals.carbsGrams} unit="g" color="bg-amber-500" />
        <MacroBar label="Fat" value={goals.fatGrams} goal={goals.fatGrams} unit="g" color="bg-rose-500" />
      </div>

      {/* Options */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">Options</p>
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => update({ includeSnacks: !goals.includeSnacks })}
            className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${
              goals.includeSnacks ? "bg-emerald-600" : "bg-slate-600"
            } relative`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                goals.includeSnacks ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-sm text-slate-300">Include daily snacks</span>
        </label>
      </div>

      {/* Dietary restrictions */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-medium mb-2">
          Dietary restrictions
        </p>
        <div className="flex flex-wrap gap-2">
          {RESTRICTIONS.map((r) => {
            const active = goals.dietaryRestrictions.includes(r);
            return (
              <button
                key={r}
                onClick={() => toggleRestriction(r)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? "border-emerald-500 bg-emerald-900/40 text-emerald-300"
                    : "border-slate-600 bg-slate-800 text-slate-400 hover:border-slate-500"
                }`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
