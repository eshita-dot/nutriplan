"use client";
import { useState } from "react";
import { Clock, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { Meal } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  meal: Meal;
  compact?: boolean;
  onRegenerate?: () => void;
  isRegenerating?: boolean;
}

const TYPE_META: Record<string, {
  label: string;
  emoji: string;
  cardBg: string;
  border: string;
  badge: string;
  calColor: string;
  stepBadge: string;
}> = {
  breakfast: {
    label: "Breakfast", emoji: "🌅",
    cardBg: "bg-teal-50",
    border: "border-teal-200",
    badge: "bg-teal-100 text-teal-800 border-teal-200",
    calColor: "text-teal-700",
    stepBadge: "bg-teal-100 text-teal-700",
  },
  lunch: {
    label: "Lunch", emoji: "☀️",
    cardBg: "bg-sky-50",
    border: "border-sky-200",
    badge: "bg-sky-100 text-sky-700 border-sky-200",
    calColor: "text-sky-600",
    stepBadge: "bg-sky-100 text-sky-600",
  },
  dinner: {
    label: "Dinner", emoji: "🌙",
    cardBg: "bg-violet-50",
    border: "border-violet-200",
    badge: "bg-violet-100 text-violet-700 border-violet-200",
    calColor: "text-violet-600",
    stepBadge: "bg-violet-100 text-violet-600",
  },
  snack: {
    label: "Evening Snack", emoji: "🍵",
    cardBg: "bg-emerald-50",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    calColor: "text-emerald-600",
    stepBadge: "bg-emerald-100 text-emerald-600",
  },
};

export function MealCard({ meal, compact = false, onRegenerate, isRegenerating }: Props) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[meal.type] ?? TYPE_META.snack;

  return (
    <div className={cn(
      "rounded-2xl border overflow-hidden transition-shadow hover:shadow-md",
      meta.cardBg,
      meta.border,
      isRegenerating && "opacity-60"
    )}>
      <div
        className={cn("cursor-pointer", compact ? "p-3.5" : "p-5")}
        onClick={() => !isRegenerating && setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Badge row */}
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", meta.badge)}>
                {meta.emoji} {meta.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-400">
                <Clock size={10} /> {meal.prepTime}m
              </span>
            </div>
            {/* Name */}
            <h3 className={cn("font-bold text-stone-800 leading-snug", compact ? "text-sm" : "text-base")}>
              {meal.name}
            </h3>
            {/* Description */}
            {meal.description && (
              <p className="text-xs text-stone-500 mt-1 line-clamp-2 leading-relaxed">{meal.description}</p>
            )}
          </div>

          {/* Calories + actions */}
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <div className="text-right">
              <div className={cn("font-bold", compact ? "text-base" : "text-xl", meta.calColor)}>
                ~{Math.round(meal.calories / 50) * 50}
              </div>
              <div className="text-xs text-stone-400">kcal</div>
            </div>
            {onRegenerate && (
              <button
                onClick={(e) => { e.stopPropagation(); onRegenerate(); }}
                disabled={isRegenerating}
                title="Regenerate this meal"
                className="p-1.5 rounded-lg bg-white/70 hover:bg-white border border-stone-200 text-stone-400 hover:text-teal-600 transition-colors disabled:opacity-40"
              >
                <RefreshCw size={12} className={isRegenerating ? "animate-spin" : ""} />
              </button>
            )}
          </div>
        </div>

        {/* Expand hint */}
        <div className="flex items-center justify-between mt-2.5">
          <p className="text-xs text-stone-400 italic">tap for recipe</p>
          <div className="text-stone-400">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </div>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-black/5 bg-white/60 p-4 space-y-4">
          {meal.ingredients.length > 0 && (
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">Ingredients</p>
              <div className="grid grid-cols-2 gap-1.5">
                {meal.ingredients.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 border border-stone-100">
                    <span className="text-xs text-stone-600 truncate">{item.ingredient.name}</span>
                    <span className="text-xs text-stone-400 ml-2 shrink-0">{item.amount}{item.ingredient.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {meal.instructions.length > 0 && (
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">How to make it</p>
              <ol className="space-y-2">
                {meal.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-600">
                    <span className={cn("shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold", meta.stepBadge)}>
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{step}</span>
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
