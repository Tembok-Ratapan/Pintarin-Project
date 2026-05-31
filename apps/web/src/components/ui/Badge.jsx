import { cn } from "../../lib/utils";

const variants = {
  default:
    "border-white/70 bg-white/52 text-[#475569] ring-1 ring-white/40 backdrop-blur-xl",
  blue:
    "border-[#5EEAD4]/55 bg-[#5EEAD4]/16 text-[#0F766E] ring-1 ring-white/40 backdrop-blur-xl",
  green:
    "border-[#5EEAD4]/55 bg-[#5EEAD4]/16 text-[#0F766E] ring-1 ring-white/40 backdrop-blur-xl",
  amber:
    "border-yellow-300/70 bg-yellow-100/70 text-yellow-800 ring-1 ring-white/40 backdrop-blur-xl",
  red:
    "border-red-300/70 bg-red-100/70 text-red-700 ring-1 ring-white/40 backdrop-blur-xl",
};

export default function Badge({ variant = "default", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3.5 py-1.5 text-xs font-extrabold leading-none tracking-[0.01em]",
        variants[variant] || variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
}