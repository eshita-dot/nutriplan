import { cn } from "@/lib/utils";

interface Props {
  children: React.ReactNode;
  variant?: "default" | "green" | "blue" | "orange" | "purple" | "red";
  className?: string;
}

const variants = {
  default: "bg-slate-700 text-slate-300",
  green: "bg-emerald-900/60 text-emerald-300",
  blue: "bg-blue-900/60 text-blue-300",
  orange: "bg-orange-900/60 text-teal-300",
  purple: "bg-purple-900/60 text-purple-300",
  red: "bg-red-900/60 text-red-300",
};

export function Badge({ children, variant = "default", className }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
