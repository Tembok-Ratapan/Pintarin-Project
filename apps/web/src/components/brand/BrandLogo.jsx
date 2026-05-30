import { APP_NAME } from "../../app/config";
import pintarinLogo from "../../assets/brand/PintarinIcon.svg";

export default function BrandLogo({ showSubtitle = true, className = "" }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`.trim()}>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/30 ring-1 ring-white/50 backdrop-blur-xl">
        <img
          src={pintarinLogo}
          alt={`${APP_NAME} logo`}
          className="h-8 w-8 object-contain"
          loading="eager"
          draggable="false"
        />
      </span>

      <span className="min-w-0 leading-none">
        <span className="block truncate text-sm font-extrabold tracking-[-0.02em] text-[#102A43]">
          {APP_NAME}
        </span>

        {showSubtitle && (
          <span className="mt-1 hidden text-xs font-medium leading-none text-[#64748B] sm:block">
            Education Aid Intelligence
          </span>
        )}
      </span>
    </div>
  );
}
