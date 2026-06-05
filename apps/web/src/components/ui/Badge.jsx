import { cn } from "../../lib/utils";

const variants = {
  default: "text-[#475569] before:bg-[#64748B]",
  blue: "text-[#0F766E] before:bg-[#14B8A6]",
  green: "text-[#0F766E] before:bg-[#14B8A6]",
  amber: "text-yellow-800 before:bg-yellow-500",
  red: "text-red-700 before:bg-red-500",
};

export default function Badge({ variant = "default", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-2 text-xs font-bold uppercase leading-none tracking-[0.1em] before:h-1.5 before:w-1.5 before:rounded-full before:content-['']",
        variants[variant] || variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
