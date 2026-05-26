"use client";
import { useState } from "react";
import { Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Meal } from "@/lib/types";
import { cn } from "@/lib/utils";

interface Props {
  meal: Meal;
  compact?: boolean;
}

const TYPE_META: Record<string, {
  label: string;
  emoji: string;
  gradient: string;
  border: string;
  badge: string;
  calColor: string;
}> = {
  breakfast: {
    label: "Breakfast",
    emoji: "🌅",
    gradient: "from-orange-950/50 to-stone-900",
    border: "border-orange-900/40",
    badge: "bg-orange-500/15 text-orange-300 border-orange-500/25",
    calColor: "text-orange-400",
  },
  lunch: {
    label: "Lunch",
    emoji: "☀️",
    gradient: "from-sky-950/50 to-stone-900",
    border: "border-sky-900/40",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    calColor: "text-sky-400",
  },
  dinner: {
    label: "Dinner",
    emoji: "🌙",
    gradient: "from-violet-950/50 to-stone-900",
    border: "border-violet-900/40",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/25",
    calColor: "text-violet-400",
  },
  snack: {
    label: "Snack",
    emoji: "🍎",
    gradient: "from-green-950/50 to-stone-900",
    border: "border-green-900/40",
    badge: "bg-green-500/15 text-green-300 border-green-500/25",
    calColor: "text-green-400",
  },
};

export function MealCard({ meal, compact = false }: Props) {
  const [expanded, setExpanded] = useState(false);
  const meta = TYPE_META[meal.type] ?? TYPE_META.snack;

  return (
    <div className={cn(
      "rounded-2xl overflow-hidden border bg-gradient-to-br transition-all",
      meta.gradient,
      meta.border,
      "hover:shadow-lg hover:shadow-black/20"
    )}>
      {/* Card header — clickable */}
      <div
        className={cn("cursor-pointer", compact ? "p-3.5" : "p-5")}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Type badge + time */}
            <div className="flex items-center gap-2 mb-2">
              <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", meta.badge)}>
                {meta.emoji} {meta.label}
              </span>
              <span className="flex items-center gap-1 text-xs text-stone-500">
                <Clock size={10} /> {meal.prepTime}m
              </span>
            </div>
            {/* Name */}
            <h3 className={cn("font-bold text-stone-100 leading-snug", compact ? "text-sm" : "text-base")}>
              {meal.name}
            </h3>
            {/* Description — always visible */}
            {meal.description && (
              <p className="text-xs text-stone-400 mt-1 line-clamp-2 leading-relaxed">{meal.description}</p>
            )}
          </div>
          {/* Calories */}
          <div className="text-right shrink-0">
            <div className={cn("font-bold", compact ? "text-base" : "text-xl", meta.calColor)}>
              ~{Math.round(meal.calories / 50) * 50}
            </div>
            <div className="text-xs text-stone-600">kcal</div>
          </div>
        </div>

        {/* Expand toggle */}
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-stone-600 italic">tap for recipe</p>
          <div className="text-stone-600">
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </div>

      {/* Expanded — ingredients + instructions */}
      {expanded && (
        <div className="border-t border-white/5 bg-black/20 p-4 space-y-4">
          {meal.ingredients.length > 0 && (
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">
                What you need
              </p>
              <div className="grid grid-cols-2 gap-1">
                {meal.ingredients.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white/5 rounded-lg px-3 py-1.5">
                    <span className="text-stone-300 truncate">{item.ingredient.name}</span>
                    <span className="text-stone-500 ml-2 shrink-0">{item.amount}{item.ingredient.unit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {meal.instructions.length > 0 && (
            <div>
              <p className="text-xs text-stone-500 font-semibold uppercase tracking-wider mb-2">
                How to make it
              </p>
              <ol className="space-y-2">
                {meal.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-300">
                    <span className={cn(
                      "shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold",
                      meta.badge, "border"
                    )}>
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
