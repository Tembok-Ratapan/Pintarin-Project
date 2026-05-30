import { cn } from "../../lib/utils";

const variants = {
  primary:
    "bg-[#0F766E] text-white shadow-lg shadow-[#5EEAD4]/25 hover:bg-[#115E59] focus-visible:outline-[#0F766E]",
  secondary:
    "border border-white/65 bg-white/50 text-[#334155] shadow-sm ring-1 ring-white/40 backdrop-blur-2xl hover:bg-white/70 focus-visible:outline-[#64748B]",
  ghost:
    "text-[#475569] hover:bg-white/45 focus-visible:outline-[#64748B]",
};

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export default function Button({
  type = "button",
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variants[variant] || variants.primary,
        sizes[size] || sizes.md,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
