import Badge from "../../../components/ui/Badge";
import { Card, CardContent } from "../../../components/ui/Card";

export default function DashboardSection({
  badge,
  title,
  description,
  action,
  children,
  className = "",
  contentClassName = "",
}) {
  return (
    <Card
      className={`border-white/70 bg-white/52 shadow-xl shadow-slate-200/35 ring-1 ring-white/40 backdrop-blur-2xl ${className}`.trim()}
    >
      <CardContent className={`p-5 sm:p-6 ${contentClassName}`.trim()}>
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            {badge && <Badge variant="green">{badge}</Badge>}

            <h2 className="font-heading mt-3 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-[#102A43] sm:text-3xl">
              {title}
            </h2>

            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[#64748B]">
                {description}
              </p>
            )}
          </div>

          {action}
        </div>

        {children}
      </CardContent>
    </Card>
  );
}