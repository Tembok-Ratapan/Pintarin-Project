import Badge from "../../../components/ui/Badge";
import { Card, CardContent } from "../../../components/ui/Card";
import { cn } from "../../../lib/utils";

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
    <Card className={cn("min-w-0", className)}>
      <CardContent className={contentClassName}>
        {(badge || title || description || action) && (
          <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              {badge && <Badge variant="green">{badge}</Badge>}

              {title && (
                <h2 className="font-heading mt-3 text-xl font-bold leading-tight text-[#102A43] sm:text-2xl">
                  {title}
                </h2>
              )}

              {description && (
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[#64748B]">
                  {description}
                </p>
              )}
            </div>

            {action}
          </div>
        )}

        {children}
      </CardContent>
    </Card>
  );
}
