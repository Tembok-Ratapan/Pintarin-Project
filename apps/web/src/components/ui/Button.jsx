import { cn } from "../../lib/utils";

const variants = {
  primary:
    "bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/18 hover:bg-[#115E59] focus-visible:outline-[#0F766E]",
  secondary:
    "border border-white/70 bg-white/58 text-[#102A43] shadow-sm ring-1 ring-white/45 backdrop-blur-2xl hover:bg-white/78 focus-visible:outline-[#0F766E]",
  ghost:
    "text-[#475569] hover:bg-white/50 hover:text-[#0F766E] focus-visible:outline-[#0F766E]",
  danger:
    "bg-red-600 text-white shadow-lg shadow-red-600/18 hover:bg-red-700 focus-visible:outline-red-600",
};

const sizes = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
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
        "inline-flex items-center justify-center gap-2.5 rounded-2xl font-extrabold leading-none tracking-[-0.01em] transition duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
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
