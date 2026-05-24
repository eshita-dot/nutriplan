"use client";
import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, UtensilsCrossed } from "lucide-react";
import { Meal } from "@/lib/types";
import { Badge } from "./ui/Badge";
import { cn } from "@/lib/utils";

interface Props {
  meal: Meal;
  compact?: boolean;
}

const TYPE_META: Record<string, { label: string; variant: "green" | "blue" | "orange" | "purple" }> = {
  breakfast: { label: "Breakfast", variant: "orange" },
  lunch: { label: "Lunch", variant: "blue" },
  dinner: { label: "Dinner", variant: "purple" },
  snack: { label: "Snack", variant: "green" },
};

export function MealCard({ meal, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[meal.type] ?? { label: meal.type, variant: "green" as const };

  return (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl overflow-hidden hover:border-slate-600 transition-colors">
      <div
        className={cn("p-4 cursor-pointer", compact && "p-3")}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant={meta.variant}>{meta.label}</Badge>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock size={11} /> {meal.prepTime}m
              </span>
            </div>
            <h3 className={cn("font-semibold text-white truncate", compact ? "text-sm" : "text-base")}>
              {meal.name}
            </h3>
            {!compact && meal.description && (
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{meal.description}</p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className={cn("font-bold text-emerald-400", compact ? "text-sm" : "text-lg")}>
              {meal.calories}
            </div>
            <div className="text-xs text-slate-500">kcal</div>
          </div>
        </div>

        {/* Macro chips */}
        <div className="flex gap-3 mt-2.5">
          <span className="text-xs text-slate-400">
            <span className="text-blue-400 font-medium">{meal.protein}g</span> P
          </span>
          <span className="text-xs text-slate-400">
            <span className="text-amber-400 font-medium">{meal.carbs}g</span> C
          </span>
          <span className="text-xs text-slate-400">
            <span className="text-rose-400 font-medium">{meal.fat}g</span> F
          </span>
        </div>

        <div className="flex items-center justify-end mt-2 text-slate-500">
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-700 p-4 space-y-4">
          {meal.ingredients.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">
                Ingredients
              </p>
              <ul className="space-y-1">
                {meal.ingredients.map((item, i) => (
                  <li key={i} className="flex items-center justify-between text-sm">
                    <span className="text-slate-300">{item.ingredient.name}</span>
                    <span className="text-slate-500">
                      {item.amount}{item.ingredient.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {meal.instructions.length > 0 && (
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <UtensilsCrossed size={12} /> Instructions
              </p>
              <ol className="space-y-2">
                {meal.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-300">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-slate-700 text-slate-400 text-xs flex items-center justify-center font-medium">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
