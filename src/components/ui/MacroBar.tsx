"use client";
import { cn, percentOfGoal, formatMacro } from "@/lib/utils";

interface Props {
  label: string;
  value: number;
  goal: number;
  unit?: string;
  color: string;
}

export function MacroBar({ label, value, goal, unit = "g", color }: Props) {
  const pct = percentOfGoal(value, goal);
  const over = value > goal;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={cn("font-medium", over ? "text-red-400" : "text-slate-200")}>
          {formatMacro(value, unit)} / {formatMacro(goal, unit)}
        </span>
      </div>
      <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color, over && "bg-red-500")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
