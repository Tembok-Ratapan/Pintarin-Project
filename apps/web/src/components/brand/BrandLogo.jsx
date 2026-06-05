import { APP_NAME } from "../../app/config";
import pintarinLogo from "../../assets/brand/PintarinIcon.svg";

export default function BrandLogo({ showSubtitle = true, className = "" }) {
  return (
    <div className={`flex min-w-0 items-center gap-3 ${className}`.trim()}>
      <img
        src={pintarinLogo}
        alt={`${APP_NAME} logo`}
        className="h-11 w-auto max-w-[2.75rem] shrink-0 object-contain"
        loading="eager"
        draggable="false"
      />

      <span className="min-w-0 leading-none">
        <span className="block truncate text-sm font-bold text-[#102A43]">
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
