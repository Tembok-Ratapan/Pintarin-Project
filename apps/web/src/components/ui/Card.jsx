import { cn } from "../../lib/utils";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[1.75rem] border border-white/60 bg-white/36 shadow-xl shadow-slate-300/20 ring-1 ring-white/40 backdrop-blur-2xl",
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
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}
