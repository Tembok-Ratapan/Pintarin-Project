import { cn } from "../../lib/utils";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/70 bg-white/52 shadow-xl shadow-slate-200/35 ring-1 ring-white/40 backdrop-blur-2xl",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={cn("p-5 sm:p-6", className)} {...props}>
      {children}
    </div>
  );
}