import { cn } from "../../lib/utils";

const variants = {
  default:
    "border-white/60 bg-white/44 text-[#475569] ring-1 ring-white/35 backdrop-blur-xl",
  blue: "border-[#5EEAD4]/55 bg-[#5EEAD4]/18 text-[#0F766E] ring-1 ring-white/35 backdrop-blur-xl",
  green:
    "border-[#5EEAD4]/55 bg-[#5EEAD4]/16 text-[#0F766E] ring-1 ring-white/35 backdrop-blur-xl",
  amber:
    "border-yellow-300/60 bg-yellow-100/60 text-yellow-800 ring-1 ring-white/35 backdrop-blur-xl",
  red: "border-red-300/60 bg-red-100/60 text-red-700 ring-1 ring-white/35 backdrop-blur-xl",
};

export default function Badge({ variant = "default", className, children }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-bold leading-none",
        variants[variant] || variants.default,
        className,
      )}
    >
      {children}
    </span>
  );
}
