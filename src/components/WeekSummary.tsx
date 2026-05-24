"use client";
import { WeekPlan } from "@/lib/types";

interface Props {
  plan: WeekPlan;
}

export function WeekSummary({ plan }: Props) {
  const totals = plan.days.reduce(
    (acc, d) => ({
      calories: acc.calories + d.totalCalories,
      protein: acc.protein + d.totalProtein,
      carbs: acc.carbs + d.totalCarbs,
      fat: acc.fat + d.totalFat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const avg = {
    calories: Math.round(totals.calories / plan.days.length),
    protein: Math.round(totals.protein / plan.days.length),
    carbs: Math.round(totals.carbs / plan.days.length),
    fat: Math.round(totals.fat / plan.days.length),
  };

  const stats = [
    { label: "Avg Calories", value: avg.calories, unit: "kcal", color: "text-emerald-400" },
    { label: "Avg Protein", value: avg.protein, unit: "g", color: "text-blue-400" },
    { label: "Avg Carbs", value: avg.carbs, unit: "g", color: "text-amber-400" },
    { label: "Avg Fat", value: avg.fat, unit: "g", color: "text-rose-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-center"
        >
          <div className={`text-2xl font-bold ${s.color}`}>
            {s.value}
            <span className="text-sm font-normal text-slate-500 ml-1">{s.unit}</span>
          </div>
          <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          <div className="text-xs text-slate-600 mt-0.5">
            target: {s.label.includes("Cal")
              ? plan.goals.dailyCalories
              : s.label.includes("Protein")
              ? plan.goals.proteinGrams
              : s.label.includes("Carbs")
              ? plan.goals.carbsGrams
              : plan.goals.fatGrams}
            {s.unit}
          </div>
        </div>
      ))}
    </div>
  );
}
