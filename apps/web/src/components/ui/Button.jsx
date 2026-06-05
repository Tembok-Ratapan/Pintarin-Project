import { cn } from "../../lib/utils";

const variants = {
  primary:
    "bg-[#0F766E] text-white shadow-[0_14px_32px_rgba(15,118,110,0.20)] hover:-translate-y-0.5 hover:bg-[#115E59] hover:shadow-[0_18px_38px_rgba(15,118,110,0.24)] active:translate-y-0 active:shadow-[0_10px_24px_rgba(15,118,110,0.18)]",
  secondary:
    "border border-white/70 bg-white/68 text-[#102A43] shadow-[0_10px_26px_rgba(15,23,42,0.07)] ring-1 ring-white/50 backdrop-blur-2xl hover:-translate-y-0.5 hover:border-white/90 hover:bg-white/88 hover:shadow-[0_16px_34px_rgba(15,23,42,0.10)] active:translate-y-0",
  ghost:
    "text-[#475569] hover:bg-white/58 hover:text-[#0F766E] active:bg-white/72",
  iconGhost:
    "text-[#0F766E] hover:-translate-y-0.5 hover:bg-[#5EEAD4]/14 hover:text-[#115E59] active:translate-y-0 active:bg-[#5EEAD4]/22",
  danger:
    "bg-red-600 text-white shadow-[0_14px_32px_rgba(220,38,38,0.18)] hover:-translate-y-0.5 hover:bg-red-700 active:translate-y-0",
};

const sizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base sm:min-w-[11rem]",
  icon: "h-11 w-11 p-0",
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
        "inline-flex select-none items-center justify-center gap-2.5 whitespace-nowrap rounded-[0.95rem] font-bold leading-none transition duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#5EEAD4]/35 disabled:pointer-events-none disabled:translate-y-0 disabled:opacity-50 disabled:shadow-none",
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
